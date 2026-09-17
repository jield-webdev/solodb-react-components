import { useState } from "react";
import { FloorPlan, PolygonPoint, PolygonPoints } from "@jield/solodb-typescript-core";
import { useDocumentKeyDown } from "@jield/solodb-react-components/modules/core/hooks/useDocumentKeyDown";
import FloorPlanView from "@jield/solodb-react-components/modules/room/components/partial/floorPlanView";
import { FloorPlanPolygonData } from "@jield/solodb-react-components/modules/room/components/partial/floorPlanPolygon";
import { FloorPlanSelection } from "@jield/solodb-react-components/modules/room/hooks/useFloorPlanSelection";
import { PolygonDraft } from "@jield/solodb-react-components/modules/room/hooks/usePolygonDraft";
import { equipmentSquarePoints } from "@jield/solodb-react-components/modules/room/utils/floorPlanGeometry";
import EditableFloorPlanPolygon from "./editableFloorPlanPolygon";
import EditableFloorPlanRectangle from "./editableFloorPlanRectangle";
import FloorPlanDraftPolygon from "./floorPlanDraftPolygon";
import FloorPlanEditorToolbar from "./floorPlanEditorToolbar";
import FloorPlanPlacementPreview from "./floorPlanPlacementPreview";
import FloorPlanStepGuide from "./floorPlanStepGuide";

export default function FloorPlanEditor({
  floorPlan,
  polygons,
  selection,
  draft,
  isDraggingTarget,
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
  isDraggingTarget: boolean;
  onComplete: (points: PolygonPoints) => void;
  onSelectPolygon: (polygon: FloorPlanPolygonData) => void;
  onChangePolygon: (polygon: FloorPlanPolygonData, points: PolygonPoints) => void;
  onCancel: () => void;
  onStopEditing: () => void;
  onDelete: () => void;
  onRemove: () => void;
  isBusy: boolean;
}) {
  const [pointer, setPointer] = useState<PolygonPoint | null>(null);
  const drawTarget = selection?.kind === "draw" ? selection.target : null;
  const editingPolygon = selection?.kind === "edit" ? selection.polygon : null;
  const staticPolygons = editingPolygon ? polygons.filter((polygon) => polygon.key !== editingPolygon.key) : polygons;
  const canDraw = drawTarget !== null && !isBusy;

  const placeAt = (point: PolygonPoint) => {
    if (drawTarget?.type === "equipment") {
      onComplete(equipmentSquarePoints(floorPlan, point));
    } else {
      draft.addPoint(point);
    }
  };

  useDocumentKeyDown((event) => {
    if (!selection || isBusy) return;

    if (event.key === "Escape" && selection.kind === "draw") {
      onCancel();
    } else if (event.key === "Escape") {
      onStopEditing();
    } else if (event.key === "Enter" && selection.kind === "draw" && draft.canClose) {
      onComplete(draft.points);
    }
  });

  return (
    <div className="floor-plan-editor">
      <FloorPlanStepGuide
        selection={selection}
        actions={
          selection && (
            <FloorPlanEditorToolbar
              selection={selection}
              draft={draft}
              onCancel={onCancel}
              onStopEditing={onStopEditing}
              onDelete={onDelete}
              onRemove={onRemove}
              isBusy={isBusy}
            />
          )
        }
      />
      <FloorPlanView
        floorPlan={floorPlan}
        polygons={staticPolygons}
        onClick={canDraw ? placeAt : undefined}
        onPointerUp={canDraw && isDraggingTarget ? placeAt : undefined}
        onPointerMove={canDraw ? setPointer : undefined}
        onPointerLeave={canDraw ? () => setPointer(null) : undefined}
        onPolygonClick={isBusy || drawTarget ? undefined : onSelectPolygon}
      >
        {(unitsPerPixel) => (
          <>
            {editingPolygon &&
              (editingPolygon.target.type === "equipment" ? (
                <EditableFloorPlanRectangle
                  floorPlan={floorPlan}
                  polygon={editingPolygon}
                  unitsPerPixel={unitsPerPixel}
                  onChange={(points) => onChangePolygon(editingPolygon, points)}
                />
              ) : (
                <EditableFloorPlanPolygon
                  floorPlan={floorPlan}
                  polygon={editingPolygon}
                  unitsPerPixel={unitsPerPixel}
                  onChange={(points) => onChangePolygon(editingPolygon, points)}
                />
              ))}
            {drawTarget?.type === "equipment" && pointer && (
              <FloorPlanPlacementPreview
                floorPlan={floorPlan}
                target={drawTarget}
                pointer={pointer}
                unitsPerPixel={unitsPerPixel}
              />
            )}
            {drawTarget?.type === "zone_group" && (
              <FloorPlanDraftPolygon
                points={draft.points}
                pointer={pointer}
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
