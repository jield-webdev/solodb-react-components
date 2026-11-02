import { Spinner } from "react-bootstrap";
import { ToolCallGroup } from "../../interfaces/primilla";
import ToolCallLabel from "./toolCallLabel";

const STATE_ICONS: Record<Exclude<ToolCallGroup["state"], "running">, string> = {
  done: "fa fa-check text-success",
  error: "fa fa-times text-danger",
};

export default function ToolCallItem({ group }: { group: ToolCallGroup }) {
  return (
    <span className="d-inline-flex align-items-center gap-2">
      {group.state === "running" ? (
        <Spinner animation="border" size="sm" className="text-primary" />
      ) : (
        <i className={STATE_ICONS[group.state]} aria-label={group.state} />
      )}
      <ToolCallLabel call={group} count={group.count} />
    </span>
  );
}
