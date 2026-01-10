import { Setup } from '@jield/solodb-typescript-core/dist/equipment/interfaces/setup';
import { Equipment } from '@jield/solodb-typescript-core';
export default function SelectedEquipmentTable({ setup, equipmentList, removeEquipment, refetchQueries, }: {
    setup: Setup;
    equipmentList: Equipment[];
    removeEquipment: (equipment: Equipment) => void;
    refetchQueries: (key: any[]) => void;
}): import("react/jsx-runtime").JSX.Element;
