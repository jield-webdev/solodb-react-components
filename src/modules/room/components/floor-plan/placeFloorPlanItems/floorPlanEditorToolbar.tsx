import { Button } from "react-bootstrap";
import { FloorPlanPolygonData } from "@jield/solodb-react-components/modules/room/components/partial/floorPlanPolygon";
import { PolygonDraft } from "@jield/solodb-react-components/modules/room/hooks/usePolygonDraft";
import { FloorPlanTarget } from "@jield/solodb-react-components/modules/room/utils/floorPlanTargets";

export type FloorPlanSelection =
  { kind: "draw"; target: FloorPlanTarget } | { kind: "edit"; polygon: FloorPlanPolygonData };

export default function FloorPlanEditorToolbar({
  selection,
  draft,
  onCancel,
  onStopEditing,
  onDelete,
  onRemove,
  isBusy,
}: {
  selection: FloorPlanSelection | null;
  draft: PolygonDraft;
  onCancel: () => void;
  onStopEditing: () => void;
  onDelete: () => void;
  onRemove: () => void;
  isBusy: boolean;
}) {
  if (!selection) {
    return (
      <span className="floor-plan-editor__message text-muted">
        Select an equipment or zone group to draw its area, or click an area on the map to move or reshape it.
      </span>
    );
  }

  if (selection.kind === "draw") {
    const isEquipment = selection.target.type === "equipment";

    return (
      <>
        <span className="floor-plan-editor__message">
          {isEquipment ? (
            <>
              Click the map to place a square for <strong>{selection.target.label}</strong>.
            </>
          ) : (
            <>
              Drawing area for <strong>{selection.target.label}</strong>: click the map to add points, click the first
              point to close the area.
            </>
          )}
        </span>
        {!isEquipment && (
          <Button
            size="sm"
            variant="outline-secondary"
            className="ms-auto"
            disabled={draft.points.length === 0}
            onClick={draft.undoPoint}
          >
            Undo point
          </Button>
        )}
        <Button size="sm" variant="outline-danger" className={isEquipment ? "ms-auto" : ""} onClick={onCancel}>
          Cancel
        </Button>
      </>
    );
  }

  const { polygon } = selection;
  const isEquipment = polygon.target.type === "equipment";

  return (
    <>
      <span className="floor-plan-editor__message">
        {isEquipment ? (
          <>
            Editing <strong>{polygon.target.label}</strong>: drag the area to move it or drag a corner to resize the
            square.
          </>
        ) : (
          <>
            Editing <strong>{polygon.target.label}</strong>: drag the area to move it or drag a point to reshape it.
          </>
        )}
      </span>
      <Button size="sm" variant="outline-secondary" className="ms-auto" onClick={onStopEditing} disabled={isBusy}>
        Done
      </Button>
      {polygon.variant === "staged" && (
        <Button size="sm" variant="outline-danger" onClick={onDelete}>
          {polygon.target.floorPlanItemId === null ? "Delete" : "Discard changes"}
        </Button>
      )}
      {polygon.target.floorPlanItemId !== null && (
        <Button
          size="sm"
          variant="danger"
          className="fw-semibold"
          onClick={onRemove}
          disabled={isBusy}
          aria-label={`Remove ${polygon.target.label} from floor plan`}
        >
          Remove from floor plan
        </Button>
      )}
    </>
  );
}
