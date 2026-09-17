import { PointerEvent } from "react";
import { PolygonPoint } from "@jield/solodb-typescript-core";

export default function FloorPlanHandle({
  point,
  unitsPerPixel,
  onPointerDown,
}: {
  point: PolygonPoint;
  unitsPerPixel: number;
  onPointerDown: (event: PointerEvent<SVGCircleElement>) => void;
}) {
  return (
    <circle
      className="floor-plan__handle"
      cx={point.x}
      cy={point.y}
      r={6 * unitsPerPixel}
      onPointerDown={onPointerDown}
    />
  );
}
