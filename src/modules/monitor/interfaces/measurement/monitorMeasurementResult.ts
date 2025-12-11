import { MonitorResultStepParameterValue } from "@/modules/monitor/interfaces/measurement/result/monitorResultStepParameterValue";
import { MonitorMeasurementResultValue } from "@/modules/monitor/interfaces/measurement/result/monitorStepParameterValue";

export interface MonitorMeasurementResult {
  id: number;
  date_created: string;
  values: MonitorMeasurementResultValue[];
}
