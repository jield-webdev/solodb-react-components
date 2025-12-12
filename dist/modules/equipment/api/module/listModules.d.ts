import { Equipment } from '../../interfaces/equipment';
import { ApiFormattedResponse } from '../../../core/interfaces/response';
import { StatusMail } from '../../interfaces/statusMail';
import { EquipmentModule } from '../../interfaces/equipment/equipmentModule';
import { Run } from '../../../run/interfaces/run';
export default function ListModules({ equipment, statusMail, run, }: {
    equipment?: Equipment;
    statusMail?: StatusMail;
    run?: Run;
}): Promise<ApiFormattedResponse<EquipmentModule>>;
