import { RunStep } from "@jield/solodb-typescript-core";

export default function isRunStepReadyForProcessing(step: RunStep): boolean {
  return true;
  // return step.previous_step_id === null || step.is_previous_step_finish;
}
