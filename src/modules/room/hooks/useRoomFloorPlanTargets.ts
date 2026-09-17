import { useMemo } from "react";
import { listEquipment, listZoneGroups } from "@jield/solodb-typescript-core";
import { useInfiniteItems } from "@jield/solodb-react-components/modules/core/hooks/useInfiniteItems";
import {
  equipmentToTarget,
  FloorPlanTarget,
  targetKey,
  zoneGroupToTarget,
} from "@jield/solodb-react-components/modules/room/utils/floorPlanTargets";

const pageSize = 25;

export const roomEquipmentQueryKey = (roomId: number) => ["equipment", "room", roomId];
export const roomZoneGroupsQueryKey = (roomId: number) => ["zoneGroups", "room", roomId];

export function useRoomFloorPlanTargets({ roomId, environment }: { roomId: number; environment?: string }) {
  const equipment = useInfiniteItems({
    queryKey: [...roomEquipmentQueryKey(roomId), environment],
    queryFn: (page) => listEquipment({ room: roomId, environment, page, pageSize }),
  });

  const zoneGroups = useInfiniteItems({
    queryKey: roomZoneGroupsQueryKey(roomId),
    queryFn: (page) => listZoneGroups({ room: roomId, page, pageSize }),
  });

  const equipmentTargets = useMemo(() => equipment.items.map(equipmentToTarget), [equipment.items]);
  const zoneGroupTargets = useMemo(() => zoneGroups.items.map(zoneGroupToTarget), [zoneGroups.items]);

  const targetsByKey = useMemo(
    () => new Map<string, FloorPlanTarget>([...equipmentTargets, ...zoneGroupTargets].map((t) => [targetKey(t), t])),
    [equipmentTargets, zoneGroupTargets]
  );

  return {
    equipment: {
      targets: equipmentTargets,
      sentinelRef: equipment.sentinelRef,
      isFetching: equipment.isFetching,
      isError: equipment.isError,
    },
    zoneGroups: {
      targets: zoneGroupTargets,
      sentinelRef: zoneGroups.sentinelRef,
      isFetching: zoneGroups.isFetching,
      isError: zoneGroups.isError,
    },
    targetsByKey,
  };
}
