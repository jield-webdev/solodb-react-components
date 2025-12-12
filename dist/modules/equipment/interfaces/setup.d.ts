import { SetupEquipment } from './setup/equipment';
import { Zone } from '../../room/interfaces/zone';
export type Setup = {
    id: number;
    title: string;
    description: string;
    zone: Zone;
    setup_equipment: SetupEquipment[];
};
