import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { afterEach, expect, it } from "vitest";
import type { Run, RunPart } from "@jield/solodb-typescript-core";
import { useParentRunSelection } from "../../../hooks/useParentRunSelection";
import RunPartPicker from "./runPartPicker";

afterEach(cleanup);

it("shows selectable cards and retains split amounts when leaving edit mode", () => {
  function Harness() {
    const selection = useParentRunSelection();
    const [editing, setEditing] = useState(false);
    return (
      <RunPartPicker
        run={{ id: 1, label: "RUN-1", name: "Parent" } as Run}
        selection={selection}
        partGroups={[{ level: 0, parts: [{ id: 10, label: "Part A" }] as RunPart[] }]}
        isLoadingParts={false}
        experimentalEdit={editing}
        onToggleExperimentalEdit={() => setEditing(!editing)}
      />
    );
  }
  render(<Harness />);
  const card = screen.getByRole("button", { name: "Select Part A" });
  expect(card).toHaveAttribute("aria-pressed", "false");
  fireEvent.click(card);
  expect(card).toHaveAttribute("aria-pressed", "true");
  expect(screen.getByText("1 selected · Total split: 1")).toBeInTheDocument();
  fireEvent.click(screen.getByText("Edit experimental split"));
  expect(screen.getByRole("checkbox", { name: "Select Part A" })).toBeChecked();
  fireEvent.change(screen.getByRole("spinbutton"), { target: { value: "12" } });
  fireEvent.click(screen.getByText("Done editing split"));
  expect(screen.getByText("Split: 12")).toBeInTheDocument();
  expect(screen.getByText("1 selected · Total split: 12")).toBeInTheDocument();
  fireEvent.click(screen.getByText("Clear selection"));
  expect(screen.getByRole("button", { name: "Select Part A" })).toHaveAttribute("aria-pressed", "false");
  expect(screen.getByText("0 selected · Total split: 0")).toBeInTheDocument();
});
