import { useCallback, useRef, useState } from "react";
import { ChatMessage } from "../interfaces/primilla";
import { toHistory } from "../utils/chatHistory";
import { applyToolEvent, closeToolCalls } from "../utils/toolCalls";
import { usePrimilla } from "./usePrimilla";

const finishMessage = (message: ChatMessage): ChatMessage => ({
  ...message,
  isStreaming: false,
  toolCalls: closeToolCalls(message.toolCalls),
});

export const usePrimillaChat = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const nextId = useRef(0);
  const { mutate, isPending } = usePrimilla();

  const updateMessage = useCallback((id: number, update: (message: ChatMessage) => ChatMessage) => {
    setMessages((current) => current.map((message) => (message.id === id ? update(message) : message)));
  }, []);

  const sendMessage = useCallback(
    (text: string) => {
      const message = text.trim();
      if (!message || isPending) return;

      const history = toHistory(messages);
      const assistantId = nextId.current + 1;
      nextId.current += 2;

      setMessages((current) => [
        ...current,
        { id: assistantId - 1, role: "user", content: message },
        { id: assistantId, role: "assistant", content: "", isStreaming: true },
      ]);

      mutate(
        {
          request: { message, history },
          onChunk: (chunk) => updateMessage(assistantId, (m) => ({ ...m, content: m.content + chunk })),
          onTool: (event) =>
            updateMessage(assistantId, (m) => ({ ...m, toolCalls: applyToolEvent(m.toolCalls ?? [], event) })),
        },
        {
          onSuccess: ({ message: content, attachments }) =>
            updateMessage(assistantId, (m) => ({ ...finishMessage(m), content, attachments })),
          onError: (error) => updateMessage(assistantId, (m) => ({ ...finishMessage(m), error: error.message })),
        }
      );
    },
    [messages, isPending, mutate, updateMessage]
  );

  return { messages, isPending, sendMessage };
};
