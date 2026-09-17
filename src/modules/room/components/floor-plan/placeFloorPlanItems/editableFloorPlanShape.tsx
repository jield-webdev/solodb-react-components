import { ReactNode, SVGProps } from "react";
import { PolygonPoints } from "@jield/solodb-typescript-core";
import FloorPlanPolygon, {
  FloorPlanPolygonData,
} from "@jield/solodb-react-components/modules/room/components/partial/floorPlanPolygon";

export default function EditableFloorPlanShape({
  polygon,
  points,
  isDragging,
  unitsPerPixel,
  groupProps,
  shapeProps,
  children,
}: {
  polygon: FloorPlanPolygonData;
  points: PolygonPoints;
  isDragging: boolean;
  unitsPerPixel: number;
  groupProps: SVGProps<SVGGElement>;
  shapeProps: SVGProps<SVGPolygonElement>;
  children: ReactNode;
}) {
  return (
    <FloorPlanPolygon
      points={points}
      label={polygon.target.label}
      targetType={polygon.target.type}
      variant={polygon.variant}
      unitsPerPixel={unitsPerPixel}
      className={"floor-plan__polygon--editing" + (isDragging ? " floor-plan__polygon--dragging" : "")}
      groupProps={groupProps}
      shapeProps={shapeProps}
    >
      {children}
    </FloorPlanPolygon>
  );
}
