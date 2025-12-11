import { MonitorMeasurementResult } from "@/modules/monitor/interfaces/measurement/monitorMeasurementResult";
import { MonitorStep } from "@/modules/monitor/interfaces/monitorStep";

export interface MonitorRequirement {
  id: number;
  title: string;
  definition: string;
  method: string;
  sequence: number;
  step: MonitorStep;
  latest_result: MonitorMeasurementResult | null;
}
