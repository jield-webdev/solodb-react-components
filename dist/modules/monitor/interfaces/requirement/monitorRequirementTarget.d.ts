import { EquipmentLoggingParameter } from '../../../equipment/interfaces/equipment/logging/equipmentLoggingParameter';
export interface MonitorRequirementTarget {
    id: number;
    min_value: number | null;
    max_value: number | null;
    target: number | null;
    is_value_inclusive: boolean;
    unit: string | null;
    logging_parameter: EquipmentLoggingParameter;
}
