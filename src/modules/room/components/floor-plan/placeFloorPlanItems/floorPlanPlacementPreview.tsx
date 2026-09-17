import { FloorPlan, PolygonPoint } from "@jield/solodb-typescript-core";
import FloorPlanPolygon from "@jield/solodb-react-components/modules/room/components/partial/floorPlanPolygon";
import { equipmentSquarePoints } from "@jield/solodb-react-components/modules/room/utils/floorPlanGeometry";
import { FloorPlanTarget } from "@jield/solodb-react-components/modules/room/utils/floorPlanTargets";

export default function FloorPlanPlacementPreview({
  floorPlan,
  target,
  pointer,
  unitsPerPixel,
}: {
  floorPlan: FloorPlan;
  target: FloorPlanTarget;
  pointer: PolygonPoint;
  unitsPerPixel: number;
}) {
  return (
    <FloorPlanPolygon
      points={equipmentSquarePoints(floorPlan, pointer)}
      label={target.label}
      targetType={target.type}
      variant="staged"
      unitsPerPixel={unitsPerPixel}
      className="floor-plan__polygon--preview"
    />
  );
}
