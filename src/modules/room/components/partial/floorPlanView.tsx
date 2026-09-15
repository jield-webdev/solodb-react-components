import { KeyboardEvent, MouseEvent, ReactNode } from "react";
import { FloorPlan, PolygonPoint } from "@jield/solodb-typescript-core";
import { useElementWidth } from "@jield/solodb-react-components/modules/core/hooks/useElementWidth";
import FloorPlanPolygon, {
  FloorPlanPolygonData,
} from "@jield/solodb-react-components/modules/room/components/partial/floorPlanPolygon";
import { floorPlanImageUrl } from "@jield/solodb-react-components/modules/room/utils/floorPlanTargets";
import { clientToFloorPlanPoint } from "@jield/solodb-react-components/modules/room/utils/floorPlanGeometry";

export default function FloorPlanView({
  floorPlan,
  polygons,
  onClick,
  onPolygonClick,
  children,
}: {
  floorPlan: FloorPlan;
  polygons: FloorPlanPolygonData[];
  onClick?: (point: PolygonPoint) => void;
  onPolygonClick?: (polygon: FloorPlanPolygonData) => void;
  children?: (unitsPerPixel: number) => ReactNode;
}) {
  const { ref, width } = useElementWidth<SVGSVGElement>();
  const unitsPerPixel = width > 0 ? floorPlan.width / width : 1;

  const handleClick = (event: MouseEvent<SVGSVGElement>) => {
    onClick?.(clientToFloorPlanPoint(event.currentTarget, floorPlan, event));
  };

  const handleKeyDown = (event: KeyboardEvent<SVGSVGElement>) => {
    if (!onClick || (event.key !== "Enter" && event.key !== " ")) return;

    event.preventDefault();
    onClick({ x: Math.round(floorPlan.width / 2), y: Math.round(floorPlan.height / 2) });
  };

  return (
    <div className="floor-plan">
      <img
        className="floor-plan__image"
        src={floorPlanImageUrl(floorPlan)}
        alt="Floor plan"
        width={floorPlan.width}
        height={floorPlan.height}
      />
      <svg
        ref={ref}
        className={"floor-plan__overlay" + (onClick ? " floor-plan__overlay--drawing" : "")}
        viewBox={`0 0 ${floorPlan.width} ${floorPlan.height}`}
        onClick={handleClick}
        onKeyDown={onClick ? handleKeyDown : undefined}
        role={onClick ? "application" : undefined}
        aria-label={onClick ? "Floor plan drawing area" : undefined}
        tabIndex={onClick ? 0 : undefined}
      >
        {polygons.map((polygon) => (
          <FloorPlanPolygon
            key={polygon.key}
            points={polygon.points}
            label={polygon.target.label}
            targetType={polygon.target.type}
            variant={polygon.variant}
            unitsPerPixel={unitsPerPixel}
            className={[
              onPolygonClick ? "floor-plan__polygon--selectable" : "",
            ]
              .filter(Boolean)
              .join(" ")}
            shapeProps={
              onPolygonClick && {
                onClick: (event) => {
                  event.stopPropagation();
                  onPolygonClick(polygon);
                },
              }
            }
          />
        ))}
        {children?.(unitsPerPixel)}
      </svg>
    </div>
  );
}
