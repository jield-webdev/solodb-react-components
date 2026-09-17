import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteRoomFloorPlanItem, FloorPlan } from "@jield/solodb-typescript-core";
import { FloorPlanPolygonData } from "@jield/solodb-react-components/modules/room/components/partial/floorPlanPolygon";
import { invalidateRoomFloorPlanQueries } from "@jield/solodb-react-components/modules/room/hooks/useRoomFloorPlan";
import {
  cancelFloorPlanItemQueries,
  optimisticallyRemoveFloorPlanItem,
  restoreFloorPlanItemCache,
} from "@jield/solodb-react-components/modules/room/utils/floorPlanCache";
import { notification } from "@jield/solodb-react-components/utils/notification";

export function useUnplaceFloorPlanItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ floorPlan, polygon }: { floorPlan: FloorPlan; polygon: FloorPlanPolygonData }) => {
      const floorPlanItem = floorPlan.items.find((item) => item.id === polygon.target.floorPlanItemId);
      if (!floorPlanItem) {
        throw new Error(`${polygon.target.label} is not placed on this floor plan`);
      }

      await deleteRoomFloorPlanItem({ floorPlanItem });
    },
    onMutate: async ({ floorPlan, polygon }) => {
      await cancelFloorPlanItemQueries(queryClient, floorPlan.room_id);
      return optimisticallyRemoveFloorPlanItem(queryClient, floorPlan.room_id, polygon.target);
    },
    onSuccess: (_, { polygon }) => {
      notification({
        notificationHeader: "Floor plan item unplaced",
        notificationBody: `${polygon.target.label} was removed from the floor plan`,
        notificationType: "success",
      });
    },
    onError: (error, _variables, context) => {
      if (context) restoreFloorPlanItemCache(queryClient, context);
      notification({
        notificationHeader: "Unplacing floor plan item failed",
        notificationBody: error instanceof Error ? error.message : "Unknown error",
        notificationType: "danger",
      });
    },
    onSettled: (_, __, { floorPlan }) => {
      invalidateRoomFloorPlanQueries(queryClient, floorPlan.room_id);
    },
  });
}
