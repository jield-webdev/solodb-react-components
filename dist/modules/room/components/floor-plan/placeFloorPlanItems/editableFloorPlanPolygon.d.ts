import { FloorPlan, PolygonPoints } from '@jield/solodb-typescript-core';
import { FloorPlanPolygonData } from '../../partial/floorPlanPolygon';
export default function EditableFloorPlanPolygon({ floorPlan, polygon, unitsPerPixel, onChange, }: {
    floorPlan: FloorPlan;
    polygon: FloorPlanPolygonData;
    unitsPerPixel: number;
    onChange: (points: PolygonPoints) => void;
}): import("react").JSX.Element;
