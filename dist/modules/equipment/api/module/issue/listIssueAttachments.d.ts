import { ApiFormattedResponse } from '../../../../core/interfaces/response';
import { Equipment } from '../../../interfaces/equipment';
import { EquipmentModule } from '../../../interfaces/equipment/equipmentModule';
import { StatusMail } from '../../../interfaces/statusMail';
import { EquipmentModuleIssueAttachment } from '../../../interfaces/equipment/module/issue/equipmentModuleIssueAttachment';
export default function ListIssueAttachments({ equipment, module, statusMail, }: {
    equipment?: Equipment;
    module?: EquipmentModule;
    statusMail?: StatusMail;
}): Promise<ApiFormattedResponse<EquipmentModuleIssueAttachment>>;
