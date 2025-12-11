import { RunPart } from "@/modules/run/interfaces/run/runPart";
import { RunStep } from "@/modules/run/interfaces/runStep";
import { RunStepPartAction } from "@/modules/run/interfaces/step/part/runStepPartAction";

export interface RunStepPart {
  id: number;
  step: RunStep;
  part: RunPart;
  date_created: string;
  part_processing_failed_in_previous_step: boolean;
  comment: string | null;
  actions: number;
  latest_action?: RunStepPartAction;
  processed: boolean;
  failed: boolean;
  started: boolean;
}
