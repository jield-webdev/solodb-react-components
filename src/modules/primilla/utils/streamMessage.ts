import { Attachment, PostMessageRequest, PostMessageResponse, ToolEvent } from "../interfaces/primilla";
import { getPrimillaPathUrl, getStreamErrorStatus, PrimillaError, primillaFetch } from "./primillaApi";
import { readSseEvents } from "./readSseEvents";

export interface StreamHandlers {
  onChunk: (chunk: string) => void;
  onTool: (event: ToolEvent) => void;
}

const getStreamErrorMessage = (data: string): string => {
  try {
    return (JSON.parse(data) as { error?: string }).error ?? "Primilla failed while answering";
  } catch {
    return "Primilla failed while answering";
  }
};

export async function streamMessage(
  request: PostMessageRequest,
  { onChunk, onTool }: StreamHandlers,
  signal?: AbortSignal
): Promise<PostMessageResponse> {
  if (!request.message.trim()) {
    throw new PrimillaError("The message cannot be empty");
  }

  const response = await primillaFetch(getPrimillaPathUrl("/send-message-sse"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: request.message, conversation_id: request.conversation_id }),
    signal,
  });

  if (!response.headers.get("Content-Type")?.toLowerCase().startsWith("text/event-stream")) {
    await response.body?.cancel();
    throw new PrimillaError("Primilla returned an unexpected response instead of an event stream", response.status);
  }

  if (!response.body) {
    throw new PrimillaError("Primilla returned an empty response");
  }

  let message = "";
  let conversationId: string | undefined;
  let attachments: Attachment[] | undefined;

  for await (const { event, data } of readSseEvents(response.body)) {
    if (event === "conversation") {
      const payload: { conversation_id?: unknown } = JSON.parse(data);
      if (conversationId || typeof payload.conversation_id !== "string" || !payload.conversation_id) {
        throw new PrimillaError("Primilla returned an invalid conversation event");
      }
      conversationId = payload.conversation_id;
      continue;
    }

    if (!conversationId) {
      throw new PrimillaError("Primilla did not identify the conversation before answering");
    }

    switch (event) {
      case "done":
        return { conversation_id: conversationId, message, attachments };
      case "error": {
        const error = getStreamErrorMessage(data);
        throw new PrimillaError(error, getStreamErrorStatus(error));
      }
      case "tool":
        onTool(JSON.parse(data) as ToolEvent);
        break;
      case "attachments":
        attachments = JSON.parse(data) as Attachment[];
        break;
      case "message": {
        const chunk = JSON.parse(data) as string;
        if (typeof chunk !== "string") {
          throw new PrimillaError("Primilla returned an invalid text chunk");
        }
        message += chunk;
        onChunk(chunk);
        break;
      }
    }
  }

  throw new PrimillaError("The connection with Primilla was closed before the answer finished");
}
