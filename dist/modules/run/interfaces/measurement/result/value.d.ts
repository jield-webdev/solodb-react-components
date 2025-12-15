import { EquipmentLoggingParameter } from '../../../../equipment/interfaces/equipment/logging/equipmentLoggingParameter';
export interface MeasurementResultValue {
    id: number;
    float_value: number;
    string_value: string;
    int_value: number;
    std_dev: number;
    unit: string;
    logging_parameter: EquipmentLoggingParameter;
    step_part_id: number;
}
