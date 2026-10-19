import { useState } from "react";
import { Collapse } from "react-bootstrap";
import { ToolCall } from "../../interfaces/primilla";
import { getLatestToolCall } from "../../utils/toolCalls";
import ToolCallItem from "./toolCallItem";
import ToolCallLabel from "./toolCallLabel";
import TypingIndicator from "./typingIndicator";

interface ToolActivityProps {
  calls: ToolCall[];
  isStreaming: boolean;
}

export default function ToolActivity({ calls, isStreaming }: ToolActivityProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const latestCall = getLatestToolCall(calls);

  return (
    <div className="small mb-2">
      <button
        type="button"
        className="btn btn-link btn-sm p-0 text-body-secondary text-decoration-none d-inline-flex align-items-center gap-2"
        aria-expanded={isExpanded}
        onClick={() => setIsExpanded((expanded) => !expanded)}
      >
        <i className={`fa ${isExpanded ? "fa-chevron-down" : "fa-chevron-right"}`} aria-hidden="true" />
        {isStreaming && latestCall ? (
          <>
            <TypingIndicator />
            <ToolCallLabel call={latestCall} />
          </>
        ) : (
          <span>
            {calls.length} tool {calls.length === 1 ? "call" : "calls"}
          </span>
        )}
      </button>
      <Collapse in={isExpanded}>
        <div>
          <ul className="list-unstyled border-start ps-3 ms-1 mt-2 mb-0 d-flex flex-column gap-1">
            {calls.map((call) => (
              <li key={call.id}>
                <ToolCallItem call={call} />
              </li>
            ))}
          </ul>
        </div>
      </Collapse>
    </div>
  );
}
