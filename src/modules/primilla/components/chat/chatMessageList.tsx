import { useEffect, useRef } from "react";
import { ChatMessage as ChatMessageType } from "../../interfaces/primilla";
import ChatMessage from "./chatMessage";
import PrimillaIcon from "./primillaIcon";

export default function ChatMessageList({ messages }: { messages: ChatMessageType[] }) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end", behavior: "smooth" });
  }, [messages]);

  return (
    <div className="d-flex flex-column gap-3 flex-grow-1 overflow-auto p-2" style={{ minHeight: 0 }}>
      {messages.length === 0 && (
        <div className="m-auto text-center text-body-secondary">
          <span className="text-primary">
            <PrimillaIcon size={64} />
          </span>
          <p className="mt-2 mb-0">Ask Primilla anything about your SoloDB data.</p>
        </div>
      )}
      {messages.map((message) => (
        <ChatMessage key={message.id} message={message} />
      ))}
      <div ref={endRef} />
    </div>
  );
}
