import { ApiFormattedResponse } from '../../../core/interfaces/response';
import { EquipmentModuleParameter } from '../../interfaces/equipment/module/equipmentModuleParameter';
import { EquipmentModule } from '../../interfaces/equipment/equipmentModule';
export default function ListEquipmentModuleParameters({ module, pageSize, order, direction, }: {
    module?: EquipmentModule;
    pageSize?: number;
    order?: "sequence";
    direction?: "asc" | "desc";
}): Promise<ApiFormattedResponse<EquipmentModuleParameter>>;
