import { PointerEvent, useState } from "react";
import { FloorPlan, PolygonPoint, PolygonPoints } from "@jield/solodb-typescript-core";
import {
  clientToFloorPlanPoint,
  movePolygonPoints,
  resizeSquarePoints,
  samePoints,
} from "@jield/solodb-react-components/modules/room/utils/floorPlanGeometry";

interface DragState {
  origin: PolygonPoint;
  vertexIndex: number | null;
  current: PolygonPoints;
}

export function usePolygonDrag({
  floorPlan,
  points,
  square = false,
  onCommit,
}: {
  floorPlan: FloorPlan;
  points: PolygonPoints;
  square?: boolean;
  onCommit: (points: PolygonPoints) => void;
}) {
  const [drag, setDrag] = useState<DragState | null>(null);

  const startDrag = (event: PointerEvent<SVGElement>, vertexIndex: number | null) => {
    const svg = event.currentTarget.ownerSVGElement;
    if (!svg) return;

    event.currentTarget.setPointerCapture(event.pointerId);
    setDrag({ origin: clientToFloorPlanPoint(svg, floorPlan, event), vertexIndex, current: points });
  };

  const onPointerMove = (event: PointerEvent<SVGGElement>) => {
    const svg = event.currentTarget.ownerSVGElement;
    if (!drag || !svg) return;

    const pointer = clientToFloorPlanPoint(svg, floorPlan, event);
    const delta = { x: pointer.x - drag.origin.x, y: pointer.y - drag.origin.y };
    const current =
      square && drag.vertexIndex !== null
        ? resizeSquarePoints(points, floorPlan, drag.vertexIndex, pointer)
        : movePolygonPoints(points, floorPlan, delta, drag.vertexIndex);

    setDrag({ ...drag, current });
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
