import { Equipment, FloorPlan, FloorPlanItemWrite, PolygonPoints, ZoneGroup } from '@jield/solodb-typescript-core';
import { FloorPlanPolygonData } from '../components/partial/floorPlanPolygon';
export type FloorPlanTargetType = "equipment" | "zone_group";
export interface FloorPlanTarget {
    type: FloorPlanTargetType;
    id: number;
    label: string;
    floorPlanItemId: number | null;
}
export interface StagedFloorPlanItem {
    target: FloorPlanTarget;
    points: PolygonPoints;
}
export declare const targetKey: ({ type, id }: Pick<FloorPlanTarget, "type" | "id">) => string;
export declare const equipmentToTarget: (equipment: Equipment) => FloorPlanTarget;
export declare const zoneGroupToTarget: (zoneGroup: ZoneGroup) => FloorPlanTarget;
export declare function toFloorPlanItemWrite(floorPlan: FloorPlan, { target, points }: StagedFloorPlanItem): FloorPlanItemWrite;
export declare function floorPlanImageUrl(floorPlan: FloorPlan): string;
export declare function buildFloorPlanPolygons(floorPlan: FloorPlan, stagedItems: StagedFloorPlanItem[], targetsByKey: Map<string, FloorPlanTarget>): FloorPlanPolygonData[];
