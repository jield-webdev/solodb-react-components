import { ApiFormattedResponse } from '../../../core/interfaces/response';
import { Measurement } from '../../interfaces/measurement';
import { MeasurementResult } from '../../interfaces/measurement/result';
export default function ListMeasurementResults({ measurement, }: {
    measurement: Measurement;
}): Promise<ApiFormattedResponse<MeasurementResult>>;
