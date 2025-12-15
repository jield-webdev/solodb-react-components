import { MonitorStepParameter } from '../../monitor/step/parameter';
import { MonitorMeasurementResult } from '../monitorMeasurementResult';
export interface MonitorResultStepParameterValue {
    id: number;
    date_created: string;
    last_updated: string | null;
    result: MonitorMeasurementResult;
    step_parameter: MonitorStepParameter;
    value: number;
}
