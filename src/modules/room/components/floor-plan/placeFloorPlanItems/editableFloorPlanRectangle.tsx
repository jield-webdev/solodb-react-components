import { FloorPlan, PolygonPoints } from "@jield/solodb-typescript-core";
import { FloorPlanPolygonData } from "@jield/solodb-react-components/modules/room/components/partial/floorPlanPolygon";
import { usePolygonDrag } from "@jield/solodb-react-components/modules/room/hooks/usePolygonDrag";
import {
  RectangleHandle,
  rectangleFromPoints,
  rectangleHandleArea,
  rectangleHandles,
} from "@jield/solodb-react-components/modules/room/utils/floorPlanGeometry";
import EditableFloorPlanShape from "./editableFloorPlanShape";
import FloorPlanResizeArea from "./floorPlanResizeArea";

const resizeBandSize = 10;

const handleCursor = ({ x, y }: RectangleHandle) => {
  if (x === null) return "ns-resize";
  if (y === null) return "ew-resize";
  return (x === "left") === (y === "top") ? "nwse-resize" : "nesw-resize";
};

export default function EditableFloorPlanRectangle({
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
  const { points, isDragging, startDrag, groupProps } = usePolygonDrag({
    floorPlan,
    points: rectangleFromPoints(floorPlan, polygon.points),
    onCommit: onChange,
  });

  return (
    <EditableFloorPlanShape
      polygon={polygon}
      points={points}
      isDragging={isDragging}
      unitsPerPixel={unitsPerPixel}
      groupProps={groupProps}
      shapeProps={{ onPointerDown: (event) => startDrag(event, { kind: "move" }) }}
    >
      {rectangleHandles.map((handle) => (
        <FloorPlanResizeArea
          key={`${handle.x}-${handle.y}`}
          area={rectangleHandleArea(points, handle, resizeBandSize * unitsPerPixel)}
          cursor={handleCursor(handle)}
          onPointerDown={(event) => startDrag(event, { kind: "resize", handle })}
        />
      ))}
    </EditableFloorPlanShape>
  );
}
