import { ToolCall, ToolCallGroup, ToolEvent } from "../interfaces/primilla";

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

export const groupToolCalls = (calls: ToolCall[]): ToolCallGroup[] =>
  calls.reduce<ToolCallGroup[]>((groups, { id, name, state }) => {
    const last = groups.at(-1);
    if (last?.name === name && last.state === state) {
      return [...groups.slice(0, -1), { ...last, count: last.count + 1 }];
    }
    return [...groups, { id, name, state, count: 1 }];
  }, []);
