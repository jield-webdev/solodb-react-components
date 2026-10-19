import { ToolCall } from "../../interfaces/primilla";

export default function ToolCallLabel({ call }: { call: ToolCall }) {
  const name = <code>{call.name}</code>;

  if (call.state === "running") return <span>Calling {name}…</span>;
  return (
    <span>
      {name} {call.state === "done" ? "ok" : "failed"}
    </span>
  );
}
