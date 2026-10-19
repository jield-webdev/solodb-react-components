import { usePrimillaChat } from "../../hooks/usePrimillaChat";
import ChatInput from "./chatInput";
import ChatMessageList from "./chatMessageList";
import PrimillaIcon from "./primillaIcon";

export default function PrimillaChatPage() {
  const { messages, isPending, sendMessage } = usePrimillaChat();

  return (
    <div
      className="d-flex flex-column gap-3 mx-auto"
      style={{ maxWidth: "80rem", height: "calc(100vh - 8rem)", minHeight: "24rem" }}
    >
      <header className="d-flex align-items-center gap-2 border-bottom pb-2">
        <span className="text-primary">
          <PrimillaIcon size={32} />
        </span>
        <h1 className="h3 mb-0">Primilla</h1>
        <span className="text-body-secondary">Your SoloDB assistant</span>
      </header>
      <ChatMessageList messages={messages} />
      <ChatInput disabled={isPending} onSend={sendMessage} />
    </div>
  );
}
