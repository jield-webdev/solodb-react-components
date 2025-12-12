import { MonitorMeasurementResult } from './measurement/monitorMeasurementResult';
import { MonitorStep } from './monitorStep';
export interface MonitorRequirement {
    id: number;
    title: string;
    definition: string;
    method: string;
    sequence: number;
    step: MonitorStep;
    latest_result: MonitorMeasurementResult | null;
}
