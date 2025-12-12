import { Equipment } from '../../interfaces/equipment';
import { Dispatch, SetStateAction } from 'react';
import { FilterData } from '../../../core/interfaces/filter';
export default function EquipmentTable({ equipmentList, currentFilter, setEquipmentSort, addEquipment, }: {
    equipmentList: Equipment[];
    currentFilter: FilterData | undefined;
    addEquipment: (equipment: Equipment) => void;
    setEquipmentSort: Dispatch<SetStateAction<{
        order: string;
        direction?: "asc" | "desc";
    }>>;
}): import("react/jsx-runtime").JSX.Element;
