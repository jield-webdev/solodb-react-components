import { FloorPlan, PolygonPoint, PolygonPoints } from "@jield/solodb-typescript-core";
import FloorPlanView from "@jield/solodb-react-components/modules/room/components/partial/floorPlanView";
import { FloorPlanPolygonData } from "@jield/solodb-react-components/modules/room/components/partial/floorPlanPolygon";
import { PolygonDraft } from "@jield/solodb-react-components/modules/room/hooks/usePolygonDraft";
import { equipmentSquarePoints } from "@jield/solodb-react-components/modules/room/utils/floorPlanGeometry";
import FloorPlanDraftPolygon from "./floorPlanDraftPolygon";
import EditableFloorPlanPolygon from "./editableFloorPlanPolygon";
import FloorPlanEditorToolbar, { FloorPlanSelection } from "./floorPlanEditorToolbar";

export default function FloorPlanEditor({
  floorPlan,
  polygons,
  selection,
  draft,
  onComplete,
  onSelectPolygon,
  onChangePolygon,
  onCancel,
  onStopEditing,
  onDelete,
  onRemove,
  isBusy,
}: {
  floorPlan: FloorPlan;
  polygons: FloorPlanPolygonData[];
  selection: FloorPlanSelection | null;
  draft: PolygonDraft;
  onComplete: (points: PolygonPoints) => void;
  onSelectPolygon: (polygon: FloorPlanPolygonData) => void;
  onChangePolygon: (polygon: FloorPlanPolygonData, points: PolygonPoints) => void;
  onCancel: () => void;
  onStopEditing: () => void;
  onDelete: () => void;
  onRemove: () => void;
  isBusy: boolean;
}) {
  const isDrawing = selection?.kind === "draw";
  const editingPolygon = selection?.kind === "edit" ? selection.polygon : null;
  const staticPolygons = editingPolygon ? polygons.filter((polygon) => polygon.key !== editingPolygon.key) : polygons;

  const handleMapClick = (point: PolygonPoint) => {
    if (!isDrawing || !selection || selection.kind !== "draw") return;

    if (selection.target.type === "equipment") {
      onComplete(equipmentSquarePoints(floorPlan, point));
    } else {
      draft.addPoint(point);
    }
  };

  return (
    <div className="floor-plan-editor">
      <div className="floor-plan-editor__toolbar d-flex align-items-center gap-2 mb-2">
        <FloorPlanEditorToolbar
          selection={selection}
          draft={draft}
          onCancel={onCancel}
          onStopEditing={onStopEditing}
          onDelete={onDelete}
          onRemove={onRemove}
          isBusy={isBusy}
        />
      </div>
      <FloorPlanView
        floorPlan={floorPlan}
        polygons={staticPolygons}
        onClick={isBusy || !isDrawing ? undefined : handleMapClick}
        onPolygonClick={isBusy || isDrawing ? undefined : onSelectPolygon}
      >
        {(unitsPerPixel) => (
          <>
            {editingPolygon && (
              <EditableFloorPlanPolygon
                floorPlan={floorPlan}
                polygon={editingPolygon}
                unitsPerPixel={unitsPerPixel}
                onChange={(points) => onChangePolygon(editingPolygon, points)}
              />
            )}
            {isDrawing && (
              <FloorPlanDraftPolygon
                points={draft.points}
                canClose={draft.canClose}
                unitsPerPixel={unitsPerPixel}
                onClose={() => onComplete(draft.points)}
              />
            )}
          </>
        )}
      </FloorPlanView>
    </div>
  );
}
