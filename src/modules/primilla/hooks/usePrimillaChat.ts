import { useCallback, useEffect, useRef, useState } from "react";
import { ChatMessage } from "../interfaces/primilla";
import { getMessageFailure } from "../utils/messageFailure";
import { PrimillaError } from "../utils/primillaApi";
import { applyToolEvent, closeToolCalls } from "../utils/toolCalls";
import { usePrimilla } from "./usePrimilla";

const finishMessage = (message: ChatMessage): ChatMessage => ({
  ...message,
  isStreaming: false,
  toolCalls: closeToolCalls(message.toolCalls),
});

export const usePrimillaChat = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isPending, setIsPending] = useState(false);
  const nextId = useRef(0);
  const conversationId = useRef<string | undefined>(undefined);
  const activeTurn = useRef<AbortController | null>(null);
  const { mutateAsync } = usePrimilla();

  useEffect(() => () => activeTurn.current?.abort(), []);

  const updateMessage = useCallback((id: number, update: (message: ChatMessage) => ChatMessage) => {
    setMessages((current) => current.map((message) => (message.id === id ? update(message) : message)));
  }, []);

  const runTurn = useCallback(
    async (message: string, userId: number, assistantId: number, startFresh = false) => {
      if (activeTurn.current) return;

      const controller = new AbortController();
      activeTurn.current = controller;
      setIsPending(true);
      if (startFresh) conversationId.current = undefined;
      updateMessage(userId, (m) => ({ ...m, isFailed: false }));

      try {
        for (let attempt = 0; attempt < 2; attempt++) {
          updateMessage(assistantId, (m) => ({
            ...m,
            content: "",
            attachments: undefined,
            toolCalls: undefined,
            isStreaming: true,
            error: undefined,
            retryAction: undefined,
          }));

          try {
            const response = await mutateAsync({
              request: { message, conversation_id: conversationId.current },
              signal: controller.signal,
              onChunk: (chunk) => updateMessage(assistantId, (m) => ({ ...m, content: m.content + chunk })),
              onTool: (event) =>
                updateMessage(assistantId, (m) => ({ ...m, toolCalls: applyToolEvent(m.toolCalls ?? [], event) })),
            });

            if (controller.signal.aborted) return;
            conversationId.current = response.conversation_id;
            updateMessage(assistantId, (m) => ({
              ...finishMessage(m),
              content: response.message,
              attachments: response.attachments,
            }));
            return;
          } catch (error) {
            if (controller.signal.aborted) return;
            const status = error instanceof PrimillaError ? error.status : undefined;
            if (status === 409 && attempt === 0) continue;
            if (status === 404 || status === 422) conversationId.current = undefined;
            updateMessage(userId, (m) => ({ ...m, isFailed: true }));
            updateMessage(assistantId, (m) => ({ ...finishMessage(m), ...getMessageFailure(error) }));
            return;
          }
        }
      } finally {
        activeTurn.current = null;
        if (!controller.signal.aborted) setIsPending(false);
      }
    },
    [mutateAsync, updateMessage]
  );

  const sendMessage = useCallback(
    (text: string) => {
      const message = text.trim();
      if (!message || activeTurn.current) return;

      const assistantId = nextId.current + 1;
      nextId.current += 2;

      setMessages((current) => [
        ...current,
        { id: assistantId - 1, role: "user", content: message },
        { id: assistantId, role: "assistant", content: "", isStreaming: true },
      ]);

      void runTurn(message, assistantId - 1, assistantId);
    },
    [runTurn]
  );

  const retryMessage = useCallback(
    (assistantId: number) => {
      const index = messages.findIndex((message) => message.id === assistantId);
      const assistant = messages[index];
      const user = messages[index - 1];
      if (!assistant?.retryAction || user?.role !== "user") return;
      void runTurn(user.content, user.id, assistantId, assistant.retryAction === "start-fresh");
    },
    [messages, runTurn]
  );

  return { messages, isPending, sendMessage, retryMessage };
};
