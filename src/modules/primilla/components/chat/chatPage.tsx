import { usePrimillaChat } from "../../hooks/usePrimillaChat";
import ChatInput from "./chatInput";
import ChatMessageList from "./chatMessageList";
import PrimillaIcon from "./primillaIcon";

export default function PrimillaChatPage() {
  const { messages, isPending, sendMessage, retryMessage } = usePrimillaChat();
  const isEmpty = messages.length === 0;

  return (
    <div
      className="d-flex flex-column mx-auto"
      style={{ maxWidth: "80rem", height: "calc(100vh - 8rem)", minHeight: "24rem" }}
    >
      {isEmpty ? (
        <div className="d-flex flex-column justify-content-center flex-grow-1 gap-4 pb-5">
          <div className="text-center">
            <span className="text-primary">
              <PrimillaIcon size={48} />
            </span>
            <h1 className="h3 fw-normal mt-2 mb-0">What do you want to know about your SoloDB data?</h1>
          </div>
          <ChatInput disabled={isPending} onSend={sendMessage} />
        </div>
      ) : (
        <>
          <ChatMessageList messages={messages} isPending={isPending} onRetry={retryMessage} />
          <div className="pt-2">
            <ChatInput disabled={isPending} onSend={sendMessage} />
          </div>
        </>
      )}
      <p className="small text-body-secondary text-center mt-2 mb-0">
        Primilla can make mistakes. Check important data in SoloDB.
      </p>
    </div>
  );
}
