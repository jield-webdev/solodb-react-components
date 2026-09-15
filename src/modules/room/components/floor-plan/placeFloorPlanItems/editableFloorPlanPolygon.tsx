import { FloorPlan, PolygonPoints } from "@jield/solodb-typescript-core";
import FloorPlanPolygon, {
  FloorPlanPolygonData,
} from "@jield/solodb-react-components/modules/room/components/partial/floorPlanPolygon";
import { usePolygonDrag } from "@jield/solodb-react-components/modules/room/hooks/usePolygonDrag";
import { equipmentSquareFromPoints } from "@jield/solodb-react-components/modules/room/utils/floorPlanGeometry";

export default function EditableFloorPlanPolygon({
  floorPlan,
  polygon,
  unitsPerPixel,
  onChange,
}: {
  floorPlan: FloorPlan;
  polygon: FloorPlanPolygonData;
  unitsPerPixel: number;
  onChange: (points: PolygonPoints) => void;
}) {
  const isEquipment = polygon.target.type === "equipment";
  const editablePoints = isEquipment ? equipmentSquareFromPoints(floorPlan, polygon.points) : polygon.points;
  const { points, isDragging, startDrag, groupProps } = usePolygonDrag({
    floorPlan,
    points: editablePoints,
    square: isEquipment,
    onCommit: onChange,
  });

  return (
    <FloorPlanPolygon
      points={points}
      label={polygon.target.label}
      targetType={polygon.target.type}
      variant={polygon.variant}
      unitsPerPixel={unitsPerPixel}
      className={"floor-plan__polygon--editing" + (isDragging ? " floor-plan__polygon--dragging" : "")}
      groupProps={groupProps}
      shapeProps={{ onPointerDown: (event) => startDrag(event, null) }}
    >
      {points.map(({ x, y }, index) => (
        <circle
          key={index}
          className="floor-plan__handle"
          cx={x}
          cy={y}
          r={6 * unitsPerPixel}
          onPointerDown={(event) => startDrag(event, index)}
        />
      ))}
    </FloorPlanPolygon>
  );
}
