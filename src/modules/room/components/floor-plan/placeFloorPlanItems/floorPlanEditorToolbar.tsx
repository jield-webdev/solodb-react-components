import { Button } from "react-bootstrap";
import { FloorPlanSelection } from "@jield/solodb-react-components/modules/room/hooks/useFloorPlanSelection";
import { PolygonDraft } from "@jield/solodb-react-components/modules/room/hooks/usePolygonDraft";

export default function FloorPlanEditorToolbar({
  selection,
  draft,
  onCancel,
  onStopEditing,
  onDelete,
  onRemove,
  isBusy,
}: {
  selection: FloorPlanSelection;
  draft: PolygonDraft;
  onCancel: () => void;
  onStopEditing: () => void;
  onDelete: () => void;
  onRemove: () => void;
  isBusy: boolean;
}) {
  if (selection.kind === "draw") {
    return (
      <>
        {selection.target.type === "zone_group" && (
          <Button size="sm" variant="outline-secondary" disabled={draft.points.length === 0} onClick={draft.undoPoint}>
            Undo point
          </Button>
        )}
        <Button size="sm" variant="outline-danger" onClick={onCancel}>
          Cancel
        </Button>
      </>
    );
  }

  const { polygon } = selection;

  return (
    <>
      <Button size="sm" variant="primary" onClick={onStopEditing} disabled={isBusy}>
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
