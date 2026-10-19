import { Attachment, PostMessageRequest, PostMessageResponse } from "../interfaces/primilla";
import { getPrimillaPathUrl, PrimillaError, primillaFetch } from "./primillaApi";
import { readSseEvents } from "./readSseEvents";

const DONE_MARKER = "[DONE]";

export async function streamMessage(
  request: PostMessageRequest,
  onChunk: (chunk: string) => void
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
    if (event === "error") {
      throw new PrimillaError("Primilla failed while answering, please try again");
    }
    if (event === "attachments") {
      attachments = JSON.parse(data) as Attachment[];
    } else if (data === DONE_MARKER) {
      return { message, attachments };
    } else {
      const chunk = JSON.parse(data) as string;
      message += chunk;
      onChunk(chunk);
    }
  }

  throw new PrimillaError("The connection with Primilla was closed before the answer finished");
}
