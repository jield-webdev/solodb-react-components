import { Parameter as ProcessParameter } from '../../../../process/interfaces/parameter';
import { Unit } from '../../../../process/interfaces/unit';
export interface EquipmentLoggingParameter {
    id: number;
    name: string;
    parameter: ProcessParameter | null;
    unit: Unit | null;
}
