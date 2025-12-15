import { EquipmentModule } from '../../interfaces/equipment/equipmentModule';
export default function GetEquipmentModule({ id }: {
    id: number;
}): Promise<EquipmentModule>;
