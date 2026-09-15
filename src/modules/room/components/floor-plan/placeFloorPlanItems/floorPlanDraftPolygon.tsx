import { MouseEvent } from "react";
import { PolygonPoints } from "@jield/solodb-typescript-core";

export default function FloorPlanDraftPolygon({
  points,
  canClose,
  unitsPerPixel,
  onClose,
}: {
  points: PolygonPoints;
  canClose: boolean;
  unitsPerPixel: number;
  onClose: () => void;
}) {
  if (points.length === 0) return null;

  const handleFirstPointClick = (event: MouseEvent<SVGCircleElement>) => {
    event.stopPropagation();
    if (canClose) onClose();
  };

  return (
    <g className="floor-plan__draft">
      <polyline points={points.map(({ x, y }) => `${x},${y}`).join(" ")} vectorEffect="non-scaling-stroke" />
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
