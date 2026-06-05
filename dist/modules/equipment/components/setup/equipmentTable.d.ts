import { default as React, Dispatch, SetStateAction } from 'react';
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
}): React.JSX.Element;
