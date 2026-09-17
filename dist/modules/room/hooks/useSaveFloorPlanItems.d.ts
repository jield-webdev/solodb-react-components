import { FloorPlan, FloorPlanItem } from '@jield/solodb-typescript-core';
import { optimisticallySaveFloorPlanItems } from '../utils/floorPlanCache';
import { StagedFloorPlanItem } from '../utils/floorPlanTargets';
interface SaveFloorPlanItemsVariables {
    roomId: number;
    floorPlan: FloorPlan;
    items: StagedFloorPlanItem[];
}
interface SaveFloorPlanItemsContext {
    cachedItems: {
        target: StagedFloorPlanItem["target"];
        item: FloorPlanItem;
    }[];
    snapshot: ReturnType<typeof optimisticallySaveFloorPlanItems>["snapshot"];
}
export declare function useSaveFloorPlanItems(): import('@tanstack/react-query').UseMutationResult<FloorPlanItem[], unknown, SaveFloorPlanItemsVariables, SaveFloorPlanItemsContext>;
export {};
