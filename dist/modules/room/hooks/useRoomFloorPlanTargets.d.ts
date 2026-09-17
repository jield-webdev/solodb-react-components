import { FloorPlanTarget } from '../utils/floorPlanTargets';
export declare const roomEquipmentQueryKey: (roomId: number) => (string | number)[];
export declare const roomZoneGroupsQueryKey: (roomId: number) => (string | number)[];
export declare function useRoomFloorPlanTargets({ roomId, environment }: {
    roomId: number;
    environment?: string;
}): {
    equipment: {
        targets: FloorPlanTarget[];
        sentinelRef: (node?: Element | null) => void;
        isFetching: boolean;
        isError: boolean;
    };
    zoneGroups: {
        targets: FloorPlanTarget[];
        sentinelRef: (node?: Element | null) => void;
        isFetching: boolean;
        isError: boolean;
    };
    targetsByKey: Map<string, FloorPlanTarget>;
};
