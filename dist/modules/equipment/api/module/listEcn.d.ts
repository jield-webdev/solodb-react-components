import { EquipmentModuleEcn } from '../../interfaces/equipment/module/equipmentModuleEcn';
import { ApiFormattedResponse } from '../../../core/interfaces/response';
import { Equipment } from '../../interfaces/equipment';
import { EquipmentModule } from '../../interfaces/equipment/equipmentModule';
import { StatusMail } from '../../interfaces/statusMail';
export default function ListEcn({ equipment, module, statusMail, }: {
    equipment?: Equipment;
    module?: EquipmentModule;
    statusMail?: StatusMail;
}): Promise<ApiFormattedResponse<EquipmentModuleEcn>>;
