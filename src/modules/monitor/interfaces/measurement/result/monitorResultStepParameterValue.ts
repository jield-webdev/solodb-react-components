import { MonitorStepParameter } from "@/modules/monitor/interfaces/monitor/step/parameter";
import { MonitorMeasurementResult } from "@/modules/monitor/interfaces/measurement/monitorMeasurementResult";

export interface MonitorResultStepParameterValue {
  id: number;
  date_created: string;
  last_updated: string | null;
  result: MonitorMeasurementResult;
  step_parameter: MonitorStepParameter;
  value: number;
}
