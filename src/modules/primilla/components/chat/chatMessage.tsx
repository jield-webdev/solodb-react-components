import { Alert, Button } from "react-bootstrap";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ChatMessage as ChatMessageType } from "../../interfaces/primilla";
import AttachmentList from "./attachmentList";
import PrimillaIcon from "./primillaIcon";
import ToolActivity from "./toolActivity";
import TypingIndicator from "./typingIndicator";

interface ChatMessageProps {
  message: ChatMessageType;
  retryDisabled: boolean;
  onRetry: (id: number) => void;
}

export default function ChatMessage({ message, retryDisabled, onRetry }: ChatMessageProps) {
  const { role, content, attachments, toolCalls = [], isStreaming = false, isFailed, error, retryAction } = message;
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
        {toolCalls.length > 0 && <ToolActivity calls={toolCalls} isStreaming={isStreaming} />}
        {content ? (
          isUser ? (
            <p className="mb-0" style={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>
              {content}
            </p>
          ) : (
            <div className="primilla-markdown">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  a: ({ node: _node, ...props }) => <a {...props} target="_blank" rel="noopener noreferrer" />,
                  table: ({ node: _node, ...props }) => (
                    <div className="table-responsive">
                      <table className="table table-sm table-bordered" {...props} />
                    </div>
                  ),
                }}
              >
                {content}
              </ReactMarkdown>
            </div>
          )
        ) : (
          isStreaming && toolCalls.length === 0 && <TypingIndicator />
        )}
        {isUser && isFailed && <div className="small mt-1">Message not saved</div>}
        {error && (
          <Alert variant="danger" className="mb-0 mt-2">
            <div>{error}</div>
            {retryAction && (
              <Button
                variant="outline-danger"
                size="sm"
                className="mt-2"
                disabled={retryDisabled}
                onClick={() => onRetry(message.id)}
              >
                {retryAction === "start-fresh" ? "Start fresh and retry" : "Retry"}
              </Button>
            )}
          </Alert>
        )}
        {attachments && <AttachmentList attachments={attachments} />}
      </div>
    </div>
  );
}
