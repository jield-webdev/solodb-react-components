import { MouseEvent } from "react";
import { FloorPlan, PolygonPoints } from "@jield/solodb-typescript-core";
import { FloorPlanPolygonData } from "@jield/solodb-react-components/modules/room/components/partial/floorPlanPolygon";
import { usePolygonDrag } from "@jield/solodb-react-components/modules/room/hooks/usePolygonDrag";
import {
  clientToFloorPlanPoint,
  insertPointOnNearestEdge,
} from "@jield/solodb-react-components/modules/room/utils/floorPlanGeometry";
import EditableFloorPlanShape from "./editableFloorPlanShape";
import FloorPlanHandle from "./floorPlanHandle";

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
  const { points, isDragging, startDrag, groupProps } = usePolygonDrag({
    floorPlan,
    points: polygon.points,
    onCommit: onChange,
  });

  const insertPoint = (event: MouseEvent<SVGPolygonElement>) => {
    const svg = event.currentTarget.ownerSVGElement;
    if (!svg) return;

    onChange(insertPointOnNearestEdge(points, clientToFloorPlanPoint(svg, floorPlan, event)));
  };

  return (
    <EditableFloorPlanShape
      polygon={polygon}
      points={points}
      isDragging={isDragging}
      unitsPerPixel={unitsPerPixel}
      groupProps={groupProps}
      shapeProps={{ onPointerDown: (event) => startDrag(event, { kind: "move" }), onDoubleClick: insertPoint }}
    >
      {points.map((point, index) => (
        <FloorPlanHandle
          key={index}
          point={point}
          unitsPerPixel={unitsPerPixel}
          onPointerDown={(event) => startDrag(event, { kind: "vertex", index })}
        />
      ))}
    </EditableFloorPlanShape>
  );
}
