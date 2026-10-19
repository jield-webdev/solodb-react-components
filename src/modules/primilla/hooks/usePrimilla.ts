import { useMutation } from "@tanstack/react-query";
import { PostMessageRequest, PostMessageResponse } from "../interfaces/primilla";
import { streamMessage } from "../utils/streamMessage";

interface SendMessageVariables {
  request: PostMessageRequest;
  onChunk: (chunk: string) => void;
}

export const usePrimilla = () =>
  useMutation<PostMessageResponse, Error, SendMessageVariables>({
    mutationFn: ({ request, onChunk }) => streamMessage(request, onChunk),
  });
