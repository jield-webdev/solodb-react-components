import { EquipmentLoggingParameter } from '../../../equipment/interfaces/equipment/logging/equipmentLoggingParameter';
export interface Target {
    id: number;
    min_value: number;
    max_value: number;
    inclusive: boolean;
    unit: string;
    logging_parameter: EquipmentLoggingParameter;
}
