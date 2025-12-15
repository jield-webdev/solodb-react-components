import { ApiFormattedResponse } from '../../../../core/interfaces/response';
import { Equipment } from '../../../interfaces/equipment';
import { EquipmentModule } from '../../../interfaces/equipment/equipmentModule';
import { StatusMail } from '../../../interfaces/statusMail';
import { EquipmentModuleEcnAttachment } from '../../../interfaces/equipment/module/ecn/equipmentModuleEcnAttachment';
export default function ListEcnAttachments({ equipment, module, statusMail, }: {
    equipment?: Equipment;
    module?: EquipmentModule;
    statusMail?: StatusMail;
}): Promise<ApiFormattedResponse<EquipmentModuleEcnAttachment>>;
