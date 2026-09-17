import { FloorPlan, PolygonPoint } from '@jield/solodb-typescript-core';
import { FloorPlanTarget } from '../../../utils/floorPlanTargets';
export default function FloorPlanPlacementPreview({ floorPlan, target, pointer, unitsPerPixel, }: {
    floorPlan: FloorPlan;
    target: FloorPlanTarget;
    pointer: PolygonPoint;
    unitsPerPixel: number;
}): import("react").JSX.Element;
