import { ReactNode } from "react";
import { FloorPlanSelection } from "@jield/solodb-react-components/modules/room/hooks/useFloorPlanSelection";
import { PolygonDraft } from "@jield/solodb-react-components/modules/room/hooks/usePolygonDraft";

function instructionFor(selection: FloorPlanSelection | null, draft: PolygonDraft): ReactNode {
  if (!selection) {
    return "Pick an item from the list, or click an area on the map to move or reshape it.";
  }

  if (selection.kind === "draw") {
    const label = <strong>{selection.target.label}</strong>;

    if (selection.target.type === "equipment") {
      return (
        <>
          Click or drop {label} on the map. <kbd>Esc</kbd> cancels.
        </>
      );
    }
    if (draft.points.length === 0) {
      return (
        <>
          Click the map to add the first corner of {label}. <kbd>Esc</kbd> cancels.
        </>
      );
    }
    return (
      <>
        Add more corners of {label} ({draft.points.length} so far), then click the first point or press <kbd>Enter</kbd>{" "}
        to close. <kbd>Esc</kbd> cancels.
      </>
    );
  }

  const label = <strong>{selection.polygon.target.label}</strong>;
  const reshape =
    selection.polygon.target.type === "equipment"
      ? "drag its border to resize it"
      : "drag a point to reshape it or double-click an edge to add one";

  return (
    <>
      Drag {label} to move it, {reshape}. Done or <kbd>Esc</kbd> finishes.
    </>
  );
}

export default function FloorPlanInstruction({
  selection,
  draft,
}: {
  selection: FloorPlanSelection | null;
  draft: PolygonDraft;
}) {
  return (
    <p className={"floor-plan-instruction small mb-0" + (selection ? "" : " text-muted")} aria-live="polite">
      {instructionFor(selection, draft)}
    </p>
  );
}
