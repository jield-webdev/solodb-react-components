import { Spinner } from "react-bootstrap";
import { ToolCall } from "../../interfaces/primilla";
import ToolCallLabel from "./toolCallLabel";

const STATE_ICONS: Record<Exclude<ToolCall["state"], "running">, string> = {
  done: "fa fa-check text-success",
  error: "fa fa-times text-danger",
};

export default function ToolCallItem({ call }: { call: ToolCall }) {
  return (
    <span className="d-inline-flex align-items-center gap-2">
      {call.state === "running" ? (
        <Spinner animation="border" size="sm" className="text-primary" />
      ) : (
        <i className={STATE_ICONS[call.state]} aria-label={call.state} />
      )}
      <ToolCallLabel call={call} />
    </span>
  );
}
