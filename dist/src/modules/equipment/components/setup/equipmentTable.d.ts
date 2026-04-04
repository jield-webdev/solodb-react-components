import { Dispatch, SetStateAction } from 'react';
import { Equipment, FilterData } from '@jield/solodb-typescript-core';
export default function EquipmentTable({ equipmentList, currentFilter, setEquipmentSort, addEquipment, addDisabled, }: {
    equipmentList: Equipment[];
    currentFilter: FilterData | undefined;
    addEquipment: (equipment: Equipment) => void;
    addDisabled?: boolean;
    setEquipmentSort: Dispatch<SetStateAction<{
        order: string;
        direction?: "asc" | "desc";
    }>>;
}): import("react/jsx-runtime").JSX.Element;
