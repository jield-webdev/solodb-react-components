import { Alert } from "react-bootstrap";
import { ChatMessage as ChatMessageType } from "../../interfaces/primilla";
import AttachmentList from "./attachmentList";
import PrimillaIcon from "./primillaIcon";
import TypingIndicator from "./typingIndicator";

export default function ChatMessage({ message }: { message: ChatMessageType }) {
  const { role, content, attachments, error } = message;
  const isUser = role === "user";

  return (
    <div className={`d-flex gap-2 align-items-start ${isUser ? "flex-row-reverse" : ""}`}>
      {!isUser && (
        <span className="text-primary flex-shrink-0">
          <PrimillaIcon size={28} />
        </span>
      )}
      <div
        className={`rounded-3 px-3 py-2 ${isUser ? "bg-primary text-white" : "bg-body-secondary text-body"}`}
        style={{ maxWidth: "85%" }}
      >
        {content ? (
          <p className="mb-0" style={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>
            {content}
          </p>
        ) : (
          !error && <TypingIndicator />
        )}
        {error && (
          <Alert variant="danger" className="mb-0 mt-2">
            {error}
          </Alert>
        )}
        {attachments && <AttachmentList attachments={attachments} />}
      </div>
    </div>
  );
}
