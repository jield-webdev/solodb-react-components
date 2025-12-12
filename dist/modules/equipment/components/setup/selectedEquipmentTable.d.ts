import { Equipment } from '../../interfaces/equipment';
import { Setup } from '../../interfaces/setup';
export default function SelectedEquipmentTable({ setup, equipmentList, removeEquipment, refetchQueries, }: {
    setup: Setup;
    equipmentList: Equipment[];
    removeEquipment: (equipment: Equipment) => void;
    refetchQueries: (key: any[]) => void;
}): import("react/jsx-runtime").JSX.Element;
