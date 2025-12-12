import { EquipmentModuleReservation } from '../../interfaces/equipment/module/equipmentModuleReservation';
import { ApiFormattedResponse } from '../../../core/interfaces/response';
import { Equipment } from '../../interfaces/equipment';
import { EquipmentModule } from '../../interfaces/equipment/equipmentModule';
export default function ListReservations({ equipment, module, which, }: {
    equipment?: Equipment;
    module?: EquipmentModule;
    which?: "active" | "past" | "upcoming";
}): Promise<ApiFormattedResponse<EquipmentModuleReservation>>;
