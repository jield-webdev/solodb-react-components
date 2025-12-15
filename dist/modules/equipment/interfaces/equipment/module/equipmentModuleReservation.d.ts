import { User } from '../../../../core/interfaces/user';
import { EquipmentModule } from '../equipmentModule';
export interface EquipmentModuleReservation {
    id: number;
    start: string;
    end: string;
    title: string;
    color: string;
    is_technical_reservation: boolean;
    is_preventive_maintenance: boolean;
    user: User;
    modules: EquipmentModule[];
    active?: boolean;
}
