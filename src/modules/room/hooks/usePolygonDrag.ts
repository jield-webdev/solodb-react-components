import { PointerEvent, useState } from "react";
import { FloorPlan, PolygonPoint, PolygonPoints } from "@jield/solodb-typescript-core";
import {
  clientToFloorPlanPoint,
  movePolygonPoints,
  RectangleHandle,
  resizeRectanglePoints,
  samePoints,
} from "@jield/solodb-react-components/modules/room/utils/floorPlanGeometry";

export type PolygonDragHandle =
  { kind: "move" } | { kind: "vertex"; index: number } | { kind: "resize"; handle: RectangleHandle };

interface DragState {
  origin: PolygonPoint;
  handle: PolygonDragHandle;
  current: PolygonPoints;
}

const dragPoints = (
  points: PolygonPoints,
  floorPlan: FloorPlan,
  { origin, handle }: DragState,
  pointer: PolygonPoint
): PolygonPoints => {
  switch (handle.kind) {
    case "resize":
      return resizeRectanglePoints(points, floorPlan, handle.handle, pointer);
    case "vertex":
      return movePolygonPoints(points, floorPlan, { x: pointer.x - origin.x, y: pointer.y - origin.y }, handle.index);
    case "move":
      return movePolygonPoints(points, floorPlan, { x: pointer.x - origin.x, y: pointer.y - origin.y }, null);
  }
};

export function usePolygonDrag({
  floorPlan,
  points,
  onCommit,
}: {
  floorPlan: FloorPlan;
  points: PolygonPoints;
  onCommit: (points: PolygonPoints) => void;
}) {
  const [drag, setDrag] = useState<DragState | null>(null);

  const startDrag = (event: PointerEvent<SVGElement>, handle: PolygonDragHandle) => {
    const svg = event.currentTarget.ownerSVGElement;
    if (!svg) return;

    event.currentTarget.setPointerCapture(event.pointerId);
    setDrag({ origin: clientToFloorPlanPoint(svg, floorPlan, event), handle, current: points });
  };

  const onPointerMove = (event: PointerEvent<SVGGElement>) => {
    const svg = event.currentTarget.ownerSVGElement;
    if (!drag || !svg) return;

    setDrag({ ...drag, current: dragPoints(points, floorPlan, drag, clientToFloorPlanPoint(svg, floorPlan, event)) });
  };

  const onPointerUp = () => {
    if (!drag) return;

    if (!samePoints(drag.current, points)) {
      onCommit(drag.current);
    }
    setDrag(null);
  };

  return {
    points: drag?.current ?? points,
    isDragging: drag !== null,
    startDrag,
    groupProps: { onPointerMove, onPointerUp, onPointerCancel: () => setDrag(null) },
  };
}
