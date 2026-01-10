import { Setup } from '../../../../../../solodb-typescript-core/src/dist/equipment/interfaces/setup';
import { Equipment } from '../../../../../../solodb-typescript-core/src/index.ts';
export default function SelectedEquipmentTable({ setup, equipmentList, removeEquipment, refetchQueries, }: {
    setup: Setup;
    equipmentList: Equipment[];
    removeEquipment: (equipment: Equipment) => void;
    refetchQueries: (key: any[]) => void;
}): import("react/jsx-runtime").JSX.Element;
