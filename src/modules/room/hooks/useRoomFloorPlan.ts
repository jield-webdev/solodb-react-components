import { QueryClient, useQuery } from "@tanstack/react-query";
import { listRoomFloorPlans } from "@jield/solodb-typescript-core";
import {
  roomEquipmentQueryKey,
  roomZoneGroupsQueryKey,
} from "@jield/solodb-react-components/modules/room/hooks/useRoomFloorPlanTargets";

export const roomFloorPlansQueryKey = (roomId: number) => ["roomFloorPlans", roomId];

export function useRoomFloorPlan(roomId: number) {
  const query = useQuery({
    queryKey: roomFloorPlansQueryKey(roomId),
    queryFn: () => listRoomFloorPlans({ room: roomId, pageSize: 1 }),
  });

  return { ...query, floorPlan: query.data?.items[0] };
}

export function invalidateRoomFloorPlanQueries(queryClient: QueryClient, roomId: number) {
  return Promise.all([
    queryClient.invalidateQueries({ queryKey: roomFloorPlansQueryKey(roomId) }),
    queryClient.invalidateQueries({ queryKey: roomEquipmentQueryKey(roomId) }),
    queryClient.invalidateQueries({ queryKey: roomZoneGroupsQueryKey(roomId) }),
  ]);
}
