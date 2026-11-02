import React from "react";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { ToolCall } from "../../interfaces/primilla";
import ToolActivity from "./toolActivity";

const calls = (names: string[]): ToolCall[] => names.map((name, id) => ({ id, name, state: "done" }));

const screenshotCalls = calls([
  "get_docs",
  "list_run",
  "list_equipment",
  "list_run",
  "save_tool",
  ...Array(6).fill("list_run"),
  "analyze_data",
  "list_equipment",
  "list_run",
  "analyze_data",
  "write_chart",
]);

const rowTexts = () =>
  within(screen.getByRole("list"))
    .getAllByRole("listitem")
    .map((row) => row.textContent);

async function expand(toolCalls: ToolCall[]) {
  const user = userEvent.setup();
  render(<ToolActivity calls={toolCalls} isStreaming={false} />);
  await user.click(screen.getByRole("button", { name: `${toolCalls.length} tool calls` }));
  return user;
}

describe("ToolActivity", () => {
  it("shows every row without a show more button when the list is short", async () => {
    await expand(calls(["get_docs", "list_run", "list_run", "write_chart"]));

    expect(rowTexts()).toEqual(["get_docs ok", "list_run ×2 ok", "write_chart ok"]);
    expect(screen.queryByRole("button", { name: /show more/i })).toBeNull();
  });

  it("shows only the latest five rows and reveals five earlier rows per click", async () => {
    const user = await expand(screenshotCalls);

    expect(rowTexts()).toEqual([
      "analyze_data ok",
      "list_equipment ok",
      "list_run ok",
      "analyze_data ok",
      "write_chart ok",
    ]);

    await user.click(screen.getByRole("button", { name: "Show more (11 earlier calls)" }));
    expect(rowTexts()).toEqual([
      "list_run ok",
      "list_equipment ok",
      "list_run ok",
      "save_tool ok",
      "list_run ×6 ok",
      "analyze_data ok",
      "list_equipment ok",
      "list_run ok",
      "analyze_data ok",
      "write_chart ok",
    ]);

    await user.click(screen.getByRole("button", { name: "Show more (1 earlier call)" }));
    expect(rowTexts()).toHaveLength(11);
    expect(rowTexts()[0]).toBe("get_docs ok");
    expect(screen.queryByRole("button", { name: /show more/i })).toBeNull();
  });
});
