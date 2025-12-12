import { MeasurementResultValue } from './result/value';
export interface MeasurementResult {
    id: number;
    values: MeasurementResultValue[];
}
