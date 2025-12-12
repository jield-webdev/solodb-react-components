import { Equipment } from '../interfaces/equipment';
export default function GetEquipment({ id }: {
    id: number;
}): Promise<Equipment>;
