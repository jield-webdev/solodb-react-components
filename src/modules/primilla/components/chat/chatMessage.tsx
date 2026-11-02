import { Alert, Button } from "react-bootstrap";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ChatMessage as ChatMessageType } from "../../interfaces/primilla";
import AttachmentList from "./attachmentList";
import CopyButton from "./copyButton";
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

  if (role === "user") {
    return (
      <div className="d-flex flex-column align-items-end">
        <p
          className="primilla-user-message bg-primary text-white px-3 py-2 mb-0"
          style={{ maxWidth: "85%", whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}
        >
          {content}
        </p>
        {isFailed && <div className="small text-danger mt-1">Message not saved</div>}
      </div>
    );
  }

  return (
    <div className="d-flex gap-3 align-items-start">
      <span className="text-primary flex-shrink-0">
        <PrimillaIcon size={28} />
      </span>
      <div className="flex-grow-1 pt-1" style={{ minWidth: 0 }}>
        {toolCalls.length > 0 && <ToolActivity calls={toolCalls} isStreaming={isStreaming} />}
        {content ? (
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
        ) : (
          isStreaming && toolCalls.length === 0 && <TypingIndicator />
        )}
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
        {content && !isStreaming && (
          <div className="mt-1" style={{ marginLeft: "-0.25rem" }}>
            <CopyButton text={content} />
          </div>
        )}
      </div>
    </div>
  );
}
