import { useMutation } from "@tanstack/react-query";
import { PostMessageRequest, PostMessageResponse } from "../interfaces/primilla";
import { StreamHandlers, streamMessage } from "../utils/streamMessage";

interface SendMessageVariables extends StreamHandlers {
  request: PostMessageRequest;
}

export const usePrimilla = () =>
  useMutation<PostMessageResponse, Error, SendMessageVariables>({
    mutationFn: ({ request, ...handlers }) => streamMessage(request, handlers),
  });
