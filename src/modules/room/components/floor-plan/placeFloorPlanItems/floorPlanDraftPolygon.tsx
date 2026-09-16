import { MouseEvent } from "react";
import { PolygonPoint, PolygonPoints } from "@jield/solodb-typescript-core";
import { toSvgPoints } from "@jield/solodb-react-components/modules/room/utils/floorPlanGeometry";

export default function FloorPlanDraftPolygon({
  points,
  pointer,
  canClose,
  unitsPerPixel,
  onClose,
}: {
  points: PolygonPoints;
  pointer: PolygonPoint | null;
  canClose: boolean;
  unitsPerPixel: number;
  onClose: () => void;
}) {
  if (points.length === 0) return null;

  const lastPoint = points[points.length - 1];

  const handleFirstPointClick = (event: MouseEvent<SVGCircleElement>) => {
    event.stopPropagation();
    if (canClose) onClose();
  };

  return (
    <g className="floor-plan__draft">
      <polyline points={toSvgPoints(points)} vectorEffect="non-scaling-stroke" />
      {pointer && (
        <line
          className="floor-plan__draft-guide"
          x1={lastPoint.x}
          y1={lastPoint.y}
          x2={pointer.x}
          y2={pointer.y}
          vectorEffect="non-scaling-stroke"
        />
      )}
      {points.map(({ x, y }, index) =>
        index === 0 ? (
          <circle
            key={index}
            className={"floor-plan__draft-start" + (canClose ? " floor-plan__draft-start--closable" : "")}
            cx={x}
            cy={y}
            r={8 * unitsPerPixel}
            onClick={handleFirstPointClick}
          >
            {canClose && <title>Click to close the area</title>}
          </circle>
        ) : (
          <circle key={index} cx={x} cy={y} r={5 * unitsPerPixel} />
        )
      )}
    </g>
  );
}
