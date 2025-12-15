import { Unit } from '../../../process/interfaces/unit';
import { Parameter as ProcessParameter } from '../../../process/interfaces/parameter';
import { StepParameterValue } from './parameter/stepParameterValue';
export interface RunStepParameter {
    id: number;
    sequence: number;
    show_in_name: boolean;
    required: boolean;
    emphasize: boolean;
    is_header: boolean;
    locked: boolean;
    parameter: ProcessParameter;
    has_unit: boolean;
    unit?: Unit;
    values: Array<StepParameterValue>;
}
