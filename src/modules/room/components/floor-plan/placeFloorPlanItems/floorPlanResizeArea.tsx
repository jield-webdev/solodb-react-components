import { PointerEvent } from "react";
import { RectangleArea } from "@jield/solodb-react-components/modules/room/utils/floorPlanGeometry";

export default function FloorPlanResizeArea({
  area,
  cursor,
  onPointerDown,
}: {
  area: RectangleArea;
  cursor: string;
  onPointerDown: (event: PointerEvent<SVGRectElement>) => void;
}) {
  return (
    <rect
      className="floor-plan__resize-area"
      x={area.x}
      y={area.y}
      width={area.width}
      height={area.height}
      style={{ cursor }}
      onPointerDown={onPointerDown}
    />
  );
}
