import {
  Equipment,
  FloorPlan,
  FloorPlanItem,
  FloorPlanItemWrite,
  PolygonPoints,
  ZoneGroup,
} from "@jield/solodb-typescript-core";
import { getSolodbServerCleanUrl } from "@jield/solodb-react-components/modules/core/config/runtimeConfig";
import { FloorPlanPolygonData } from "@jield/solodb-react-components/modules/room/components/partial/floorPlanPolygon";

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

export const targetKey = ({ type, id }: Pick<FloorPlanTarget, "type" | "id">) => `${type}-${id}`;

export const equipmentToTarget = (equipment: Equipment): FloorPlanTarget => ({
  type: "equipment",
  id: equipment.id,
  label: equipment.name,
  floorPlanItemId: equipment.floor_plan_item_id,
});

export const zoneGroupToTarget = (zoneGroup: ZoneGroup): FloorPlanTarget => ({
  type: "zone_group",
  id: zoneGroup.id,
  label: zoneGroup.name,
  floorPlanItemId: zoneGroup.floor_plan_item_id,
});

function floorPlanItemToTarget(item: FloorPlanItem): FloorPlanTarget | null {
  if (item.equipment_id !== null) {
    return {
      type: "equipment",
      id: item.equipment_id,
      label: `Equipment #${item.equipment_id}`,
      floorPlanItemId: item.id,
    };
  }
  if (item.zone_group_id !== null) {
    return {
      type: "zone_group",
      id: item.zone_group_id,
      label: `Zone group #${item.zone_group_id}`,
      floorPlanItemId: item.id,
    };
  }
  return null;
}

export function toFloorPlanItemWrite(
  floorPlan: FloorPlan,
  { target, points }: StagedFloorPlanItem
): FloorPlanItemWrite {
  return target.type === "equipment"
    ? { floor_plan_id: floorPlan.id, points, equipment_id: target.id }
    : { floor_plan_id: floorPlan.id, points, zone_group_id: target.id };
}

export function floorPlanImageUrl(floorPlan: FloorPlan): string {
  return new URL(floorPlan.url, getSolodbServerCleanUrl() || window.location.origin).toString();
}

export function buildFloorPlanPolygons(
  floorPlan: FloorPlan,
  stagedItems: StagedFloorPlanItem[],
  targetsByKey: Map<string, FloorPlanTarget>
): FloorPlanPolygonData[] {
  const stagedKeys = new Set(stagedItems.map((item) => targetKey(item.target)));

  const existing = floorPlan.items.flatMap((item): FloorPlanPolygonData[] => {
    const fallbackTarget = floorPlanItemToTarget(item);
    if (fallbackTarget === null || stagedKeys.has(targetKey(fallbackTarget))) {
      return [];
    }

    const key = targetKey(fallbackTarget);
    return [{ key, target: targetsByKey.get(key) ?? fallbackTarget, points: item.points, variant: "existing" }];
  });

  const staged = stagedItems.map((item): FloorPlanPolygonData => ({
    key: targetKey(item.target),
    target: item.target,
    points: item.points,
    variant: "staged",
  }));

  return [...existing, ...staged];
}
