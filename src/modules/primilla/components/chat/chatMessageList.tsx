import { useEffect, useRef } from "react";
import { ChatMessage as ChatMessageType } from "../../interfaces/primilla";
import ChatMessage from "./chatMessage";

interface ChatMessageListProps {
  messages: ChatMessageType[];
  isPending: boolean;
  onRetry: (id: number) => void;
}

export default function ChatMessageList({ messages, isPending, onRetry }: ChatMessageListProps) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end", behavior: "smooth" });
  }, [messages]);

  return (
    <div className="d-flex flex-column gap-4 flex-grow-1 overflow-auto py-3 px-1" style={{ minHeight: 0 }}>
      {messages.map((message) => (
        <ChatMessage key={message.id} message={message} retryDisabled={isPending} onRetry={onRetry} />
      ))}
      <div ref={endRef} />
    </div>
  );
}
