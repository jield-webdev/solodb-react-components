import { useState } from "react";
import { Collapse } from "react-bootstrap";
import { ToolCall } from "../../interfaces/primilla";
import { getLatestToolCall, groupToolCalls } from "../../utils/toolCalls";
import ToolCallItem from "./toolCallItem";
import ToolCallLabel from "./toolCallLabel";
import TypingIndicator from "./typingIndicator";

const TOOL_CALL_ROWS_PER_PAGE = 5;

interface ToolActivityProps {
  calls: ToolCall[];
  isStreaming: boolean;
}

export default function ToolActivity({ calls, isStreaming }: ToolActivityProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [visibleRows, setVisibleRows] = useState(TOOL_CALL_ROWS_PER_PAGE);
  const latestCall = getLatestToolCall(calls);
  const groups = groupToolCalls(calls);
  const hiddenGroups = groups.slice(0, Math.max(groups.length - visibleRows, 0));
  const visibleGroups = groups.slice(hiddenGroups.length);
  const hiddenCallCount = hiddenGroups.reduce((total, group) => total + group.count, 0);

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
          {hiddenCallCount > 0 && (
            <button
              type="button"
              className="btn btn-link btn-sm p-0 ms-1 mt-2 text-body-secondary"
              onClick={() => setVisibleRows((rows) => rows + TOOL_CALL_ROWS_PER_PAGE)}
            >
              Show more ({hiddenCallCount} earlier {hiddenCallCount === 1 ? "call" : "calls"})
            </button>
          )}
          <ul className="list-unstyled border-start ps-3 ms-1 mt-2 mb-0 d-flex flex-column gap-1">
            {visibleGroups.map((group) => (
              <li key={group.id}>
                <ToolCallItem group={group} />
              </li>
            ))}
          </ul>
        </div>
      </Collapse>
    </div>
  );
}
