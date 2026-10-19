import { ToolCall, ToolEvent } from "../interfaces/primilla";

const updateAt = (calls: ToolCall[], index: number, update: Partial<ToolCall>) =>
  calls.map((call, i) => (i === index ? { ...call, ...update } : call));

// Events carry no call id and may arrive out of order, so a finish can precede its start.
export function applyToolEvent(calls: ToolCall[], { name, state }: ToolEvent): ToolCall[] {
  if (state === "start") {
    const finishedEarly = calls.findIndex((call) => call.name === name && call.awaitingStart);
    if (finishedEarly !== -1) return updateAt(calls, finishedEarly, { awaitingStart: false });
    return [...calls, { id: calls.length, name, state: "running" }];
  }

  const running = calls.findIndex((call) => call.name === name && call.state === "running");
  if (running !== -1) return updateAt(calls, running, { state });
  return [...calls, { id: calls.length, name, state, awaitingStart: true }];
}

export const closeToolCalls = (calls?: ToolCall[]): ToolCall[] | undefined =>
  calls?.map((call) => (call.state === "running" ? { ...call, state: "done" } : call));

export const getLatestToolCall = (calls: ToolCall[]): ToolCall | undefined =>
  calls.findLast((call) => call.state === "running") ?? calls.at(-1);
