import { MonitorMeasurementResultValue } from './result/monitorStepParameterValue';
export interface MonitorMeasurementResult {
    id: number;
    date_created: string;
    values: MonitorMeasurementResultValue[];
}
