import { Equipment } from '@jield/solodb-typescript-core';
export default function SelectedEquipmentTable({ equipmentList, removeEquipment, }: {
    equipmentList: Equipment[];
    removeEquipment: (equipment: Equipment) => void;
}): import("react/jsx-runtime").JSX.Element;
