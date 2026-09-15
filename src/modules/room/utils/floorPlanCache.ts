import { InfiniteData, QueryClient, QueryKey } from "@tanstack/react-query";
import { ApiFormattedResponse, Equipment, FloorPlan, FloorPlanItem, ZoneGroup } from "@jield/solodb-typescript-core";
import { roomFloorPlansQueryKey } from "@jield/solodb-react-components/modules/room/hooks/useRoomFloorPlan";
import {
  roomEquipmentQueryKey,
  roomZoneGroupsQueryKey,
} from "@jield/solodb-react-components/modules/room/hooks/useRoomFloorPlanTargets";
import {
  FloorPlanTarget,
  FloorPlanTargetType,
  StagedFloorPlanItem,
  targetKey,
} from "@jield/solodb-react-components/modules/room/utils/floorPlanTargets";

type InfiniteItems<T> = InfiniteData<ApiFormattedResponse<T>>;
type CachedQuery<T> = [QueryKey, InfiniteItems<T> | undefined];

export interface FloorPlanCacheSnapshot {
  roomId: number;
  floorPlan: ApiFormattedResponse<FloorPlan> | undefined;
  equipment: CachedQuery<Equipment>[];
  zoneGroups: CachedQuery<ZoneGroup>[];
}

export interface CachedFloorPlanItem {
  target: FloorPlanTarget;
  item: FloorPlanItem;
}

let nextOptimisticFloorPlanItemId = -1;

const nextOptimisticId = () => nextOptimisticFloorPlanItemId--;

const itemMatchesTarget = (item: FloorPlanItem, target: FloorPlanTarget) =>
  item.id === target.floorPlanItemId ||
  (target.type === "equipment" ? item.equipment_id === target.id : item.zone_group_id === target.id);

const floorPlanItemForTarget = (
  target: FloorPlanTarget,
  id: number,
  points: FloorPlanItem["points"]
): FloorPlanItem => ({
  id,
  points,
  equipment_id: target.type === "equipment" ? target.id : null,
  zone_group_id: target.type === "zone_group" ? target.id : null,
});

const captureFloorPlanCache = (queryClient: QueryClient, roomId: number): FloorPlanCacheSnapshot => ({
  roomId,
  floorPlan: queryClient.getQueryData<ApiFormattedResponse<FloorPlan>>(roomFloorPlansQueryKey(roomId)),
  equipment: queryClient.getQueriesData<InfiniteItems<Equipment>>({ queryKey: roomEquipmentQueryKey(roomId) }),
  zoneGroups: queryClient.getQueriesData<InfiniteItems<ZoneGroup>>({ queryKey: roomZoneGroupsQueryKey(roomId) }),
});

const updateInfiniteTargetItems = <T extends { id: number; floor_plan_item_id: number | null }>(
  data: InfiniteItems<T> | undefined,
  type: FloorPlanTargetType,
  floorPlanItemIds: Map<string, number | null>
): InfiniteItems<T> | undefined => {
  if (!data) return data;

  return {
    ...data,
    pages: data.pages.map((page) => ({
      ...page,
      items: page.items.map((item) => {
        const floorPlanItemId = floorPlanItemIds.get(targetKey({ type, id: item.id }));
        return floorPlanItemId === undefined ? item : { ...item, floor_plan_item_id: floorPlanItemId };
      }),
    })),
  };
};

const updateTargetCaches = (
  queryClient: QueryClient,
  roomId: number,
  items: CachedFloorPlanItem[],
  removedTargets: FloorPlanTarget[] = []
) => {
  const equipmentIds = new Map<string, number | null>();
  const zoneGroupIds = new Map<string, number | null>();

  for (const { target, item } of items) {
    (target.type === "equipment" ? equipmentIds : zoneGroupIds).set(targetKey(target), item.id);
  }
  for (const target of removedTargets) {
    (target.type === "equipment" ? equipmentIds : zoneGroupIds).set(targetKey(target), null);
  }

  queryClient.setQueriesData<InfiniteItems<Equipment>>({ queryKey: roomEquipmentQueryKey(roomId) }, (data) =>
    updateInfiniteTargetItems(data, "equipment", equipmentIds)
  );
  queryClient.setQueriesData<InfiniteItems<ZoneGroup>>({ queryKey: roomZoneGroupsQueryKey(roomId) }, (data) =>
    updateInfiniteTargetItems(data, "zone_group", zoneGroupIds)
  );
};

export function updateFloorPlanItemCache(queryClient: QueryClient, roomId: number, items: CachedFloorPlanItem[]) {
  queryClient.setQueryData<ApiFormattedResponse<FloorPlan>>(roomFloorPlansQueryKey(roomId), (data) => {
    if (!data) return data;
    const currentFloorPlan = data.items[0];
    if (!currentFloorPlan) return data;

    let floorPlanItems = currentFloorPlan.items;
    for (const { target, item } of items) {
      const itemIndex = floorPlanItems.findIndex(
        (candidate) => candidate.id === item.id || itemMatchesTarget(candidate, target)
      );
      floorPlanItems =
        itemIndex === -1
          ? [...floorPlanItems, item]
          : floorPlanItems.map((candidate, index) => (index === itemIndex ? item : candidate));
    }

    return {
      ...data,
      items: data.items.map((candidate, index) => (index === 0 ? { ...candidate, items: floorPlanItems } : candidate)),
    };
  });
  updateTargetCaches(queryClient, roomId, items);
}

export const cancelFloorPlanItemQueries = async (queryClient: QueryClient, roomId: number) => {
  await Promise.all([
    queryClient.cancelQueries({ queryKey: roomFloorPlansQueryKey(roomId) }),
    queryClient.cancelQueries({ queryKey: roomEquipmentQueryKey(roomId) }),
    queryClient.cancelQueries({ queryKey: roomZoneGroupsQueryKey(roomId) }),
  ]);
};

export function optimisticallySaveFloorPlanItems(
  queryClient: QueryClient,
  roomId: number,
  floorPlan: FloorPlan,
  stagedItems: StagedFloorPlanItem[]
) {
  const snapshot = captureFloorPlanCache(queryClient, roomId);
  const cachedItems = stagedItems.map(({ target, points }) => {
    const existingItem = floorPlan.items.find((item) => itemMatchesTarget(item, target));
    const item = floorPlanItemForTarget(target, existingItem?.id ?? nextOptimisticId(), points);
    return { target, item };
  });

  updateFloorPlanItemCache(queryClient, roomId, cachedItems);

  return { snapshot, cachedItems };
}

export function applySavedFloorPlanItems(
  queryClient: QueryClient,
  roomId: number,
  cachedItems: CachedFloorPlanItem[],
  savedItems: FloorPlanItem[]
) {
  updateFloorPlanItemCache(
    queryClient,
    roomId,
    cachedItems.map((cachedItem, index) => ({
      target: cachedItem.target,
      item: savedItems[index] ?? cachedItem.item,
    }))
  );
}

export function optimisticallyRemoveFloorPlanItem(queryClient: QueryClient, roomId: number, target: FloorPlanTarget) {
  const snapshot = captureFloorPlanCache(queryClient, roomId);
  queryClient.setQueryData<ApiFormattedResponse<FloorPlan>>(roomFloorPlansQueryKey(roomId), (data) => {
    if (!data) return data;
    const currentFloorPlan = data.items[0];
    if (!currentFloorPlan) return data;

    return {
      ...data,
      items: data.items.map((candidate, index) =>
        index === 0
          ? { ...candidate, items: candidate.items.filter((item) => !itemMatchesTarget(item, target)) }
          : candidate
      ),
    };
  });

  updateTargetCaches(queryClient, roomId, [], [target]);

  return snapshot;
}

export function restoreFloorPlanItemCache(queryClient: QueryClient, snapshot: FloorPlanCacheSnapshot) {
  queryClient.setQueryData(roomFloorPlansQueryKey(snapshot.roomId), snapshot.floorPlan);
  for (const [queryKey, data] of snapshot.equipment) {
    queryClient.setQueryData(queryKey, data);
  }
  for (const [queryKey, data] of snapshot.zoneGroups) {
    queryClient.setQueryData(queryKey, data);
  }
}
