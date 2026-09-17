import { ReactNode, SVGProps } from "react";
import { PolygonPoints } from "@jield/solodb-typescript-core";
import {
  FloorPlanTarget,
  FloorPlanTargetType,
} from "@jield/solodb-react-components/modules/room/utils/floorPlanTargets";
import { polygonCentroid, toSvgPoints } from "@jield/solodb-react-components/modules/room/utils/floorPlanGeometry";

export interface FloorPlanPolygonData {
  key: string;
  target: FloorPlanTarget;
  points: PolygonPoints;
  variant: "existing" | "staged";
}

export default function FloorPlanPolygon({
  points,
  label,
  targetType,
  variant,
  unitsPerPixel,
  className = "",
  groupProps,
  shapeProps,
  children,
}: {
  points: PolygonPoints;
  label: string;
  targetType: FloorPlanTargetType;
  variant: FloorPlanPolygonData["variant"];
  unitsPerPixel: number;
  className?: string;
  groupProps?: SVGProps<SVGGElement>;
  shapeProps?: SVGProps<SVGPolygonElement>;
  children?: ReactNode;
}) {
  const center = polygonCentroid(points);
  const targetTypeClass = targetType === "zone_group" ? "zone-group" : "equipment";

  return (
    <g
      className={`floor-plan__polygon floor-plan__polygon--${variant} floor-plan__polygon--${targetTypeClass} ${className}`}
      {...groupProps}
    >
      <polygon points={toSvgPoints(points)} vectorEffect="non-scaling-stroke" {...shapeProps} />
      <text x={center.x} y={center.y} fontSize={12 * unitsPerPixel}>
        {label}
      </text>
      {children}
    </g>
  );
}
