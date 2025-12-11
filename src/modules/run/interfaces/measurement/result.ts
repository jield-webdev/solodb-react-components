import { MeasurementResultValue } from "@/modules/run/interfaces/measurement/result/value";

export interface MeasurementResult {
  id: number;
  values: MeasurementResultValue[];
}
