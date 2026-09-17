import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createRoomFloorPlanItem, FloorPlan, FloorPlanItem } from "@jield/solodb-typescript-core";
import { invalidateRoomFloorPlanQueries } from "@jield/solodb-react-components/modules/room/hooks/useRoomFloorPlan";
import {
  applySavedFloorPlanItems,
  cancelFloorPlanItemQueries,
  optimisticallySaveFloorPlanItems,
  restoreFloorPlanItemCache,
} from "@jield/solodb-react-components/modules/room/utils/floorPlanCache";
import {
  StagedFloorPlanItem,
  toFloorPlanItemWrite,
} from "@jield/solodb-react-components/modules/room/utils/floorPlanTargets";
import { notification } from "@jield/solodb-react-components/utils/notification";

interface SaveFloorPlanItemsVariables {
  roomId: number;
  floorPlan: FloorPlan;
  items: StagedFloorPlanItem[];
}

interface SaveFloorPlanItemsContext {
  cachedItems: { target: StagedFloorPlanItem["target"]; item: FloorPlanItem }[];
  snapshot: ReturnType<typeof optimisticallySaveFloorPlanItems>["snapshot"];
}

export function useSaveFloorPlanItems() {
  const queryClient = useQueryClient();

  return useMutation<FloorPlanItem[], unknown, SaveFloorPlanItemsVariables, SaveFloorPlanItemsContext>({
    mutationFn: async ({ roomId, floorPlan, items }) =>
      Promise.all(
        items.map((item) => createRoomFloorPlanItem({ id: roomId, ...toFloorPlanItemWrite(floorPlan, item) }))
      ),
    onMutate: async ({ roomId, floorPlan, items }) => {
      await cancelFloorPlanItemQueries(queryClient, roomId);
      return optimisticallySaveFloorPlanItems(queryClient, roomId, floorPlan, items);
    },
    onSuccess: (savedItems, { roomId }, context) => {
      applySavedFloorPlanItems(queryClient, roomId, context.cachedItems, savedItems);
      notification({
        notificationHeader: "Floor plan saved",
        notificationBody: "Floor plan changes were saved",
        notificationType: "success",
      });
    },
    onError: (error, { roomId }, context) => {
      if (context) restoreFloorPlanItemCache(queryClient, context.snapshot);
      notification({
        notificationHeader: "Saving floor plan items failed",
        notificationBody: error instanceof Error ? error.message : "Unknown error",
        notificationType: "danger",
      });
    },
    onSettled: (_, __, { roomId }) => invalidateRoomFloorPlanQueries(queryClient, roomId),
  });
}
