import { Attachment, PostMessageRequest, PostMessageResponse, ToolEvent } from "../interfaces/primilla";
import { getPrimillaPathUrl, PrimillaError, primillaFetch } from "./primillaApi";
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
  { onChunk, onTool }: StreamHandlers
): Promise<PostMessageResponse> {
  if (!request.message.trim()) {
    throw new PrimillaError("The message cannot be empty");
  }

  const response = await primillaFetch(getPrimillaPathUrl("/send-message-sse"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });

  if (!response.body) {
    throw new PrimillaError("Primilla returned an empty response");
  }

  let message = "";
  let attachments: Attachment[] | undefined;

  for await (const { event, data } of readSseEvents(response.body)) {
    switch (event) {
      case "done":
        return { message, attachments };
      case "error":
        throw new PrimillaError(getStreamErrorMessage(data));
      case "tool":
        onTool(JSON.parse(data) as ToolEvent);
        break;
      case "attachments":
        attachments = JSON.parse(data) as Attachment[];
        break;
      case "message": {
        const chunk = JSON.parse(data) as string;
        message += chunk;
        onChunk(chunk);
        break;
      }
    }
  }

  throw new PrimillaError("The connection with Primilla was closed before the answer finished");
}
