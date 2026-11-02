import { describe, expect, it } from "vitest";
import { ToolCall } from "../interfaces/primilla";
import { groupToolCalls } from "./toolCalls";

const call = (id: number, name: string, state: ToolCall["state"] = "done"): ToolCall => ({ id, name, state });

describe("groupToolCalls", () => {
  it("returns no groups for no calls", () => {
    expect(groupToolCalls([])).toEqual([]);
  });

  it("merges consecutive calls with the same name and state", () => {
    expect(groupToolCalls([call(0, "list_run"), call(1, "list_run"), call(2, "list_run")])).toEqual([
      { id: 0, name: "list_run", state: "done", count: 3 },
    ]);
  });

  it("keeps non-consecutive calls of the same tool apart", () => {
    expect(groupToolCalls([call(0, "list_run"), call(1, "save_tool"), call(2, "list_run")])).toEqual([
      { id: 0, name: "list_run", state: "done", count: 1 },
      { id: 1, name: "save_tool", state: "done", count: 1 },
      { id: 2, name: "list_run", state: "done", count: 1 },
    ]);
  });

  it("keeps calls with a different state apart", () => {
    expect(
      groupToolCalls([
        call(0, "list_run"),
        call(1, "list_run", "error"),
        call(2, "list_run", "error"),
        call(3, "list_run", "running"),
      ])
    ).toEqual([
      { id: 0, name: "list_run", state: "done", count: 1 },
      { id: 1, name: "list_run", state: "error", count: 2 },
      { id: 3, name: "list_run", state: "running", count: 1 },
    ]);
  });
});
