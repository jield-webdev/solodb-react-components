import { InfiniteData, QueryClient, QueryKey } from '@tanstack/react-query';
import { ApiFormattedResponse, Equipment, FloorPlan, FloorPlanItem, ZoneGroup } from '@jield/solodb-typescript-core';
import { FloorPlanTarget, StagedFloorPlanItem } from './floorPlanTargets';
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
export declare function updateFloorPlanItemCache(queryClient: QueryClient, roomId: number, items: CachedFloorPlanItem[]): void;
export declare const cancelFloorPlanItemQueries: (queryClient: QueryClient, roomId: number) => Promise<void>;
export declare function optimisticallySaveFloorPlanItems(queryClient: QueryClient, roomId: number, floorPlan: FloorPlan, stagedItems: StagedFloorPlanItem[]): {
    snapshot: FloorPlanCacheSnapshot;
    cachedItems: {
        target: FloorPlanTarget;
        item: FloorPlanItem;
    }[];
};
export declare function applySavedFloorPlanItems(queryClient: QueryClient, roomId: number, cachedItems: CachedFloorPlanItem[], savedItems: FloorPlanItem[]): void;
export declare function optimisticallyRemoveFloorPlanItem(queryClient: QueryClient, roomId: number, target: FloorPlanTarget): FloorPlanCacheSnapshot;
export declare function restoreFloorPlanItemCache(queryClient: QueryClient, snapshot: FloorPlanCacheSnapshot): void;
export {};
