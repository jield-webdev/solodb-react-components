import { ToolCall } from "../../interfaces/primilla";

interface ToolCallLabelProps {
  call: ToolCall;
  count?: number;
}

export default function ToolCallLabel({ call, count = 1 }: ToolCallLabelProps) {
  const name = (
    <>
      <code>{call.name}</code>
      {count > 1 && ` ×${count}`}
    </>
  );

  if (call.state === "running") return <span>Calling {name}…</span>;
  return (
    <span>
      {name} {call.state === "done" ? "ok" : "failed"}
    </span>
  );
}
