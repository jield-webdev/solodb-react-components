import { useCallback, useRef } from "react";
import getPrimillaUrl from "../utils/getPrimillaEndpoint";

export const usePrimilla = () => {
  const authToken: string = document.getElementById("root")?.dataset.jwt ?? "";

  const endpoint = new URL("/send-message", getPrimillaUrl()).href;

  const sendMessage = useCallback(
    async (req: PostMessageRequest): Promise<PostMessageResponse> => {
      const options = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(req),
      };

      const resp = await fetch(endpoint, options);

      const body: PostMessageResponse = await resp.json();

      return body;
    },
    [endpoint]
  );

  return {
    sendMessage: sendMessage,
  };
};

interface PostMessageRequest {
  message: string;
  history?: HistoryMessage[];
}

interface HistoryMessage {
  role: string;
  content: string;
}

interface PostMessageResponse {
  message: string;
  attachments?: Attachment[];
}

interface Attachment {
  url: URL;
  filename: string;
  content_type: string;
  size: number;
}
