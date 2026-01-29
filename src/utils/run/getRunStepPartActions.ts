import { RunStepPart, RunStepPartActionEnum } from "@jield/solodb-typescript-core";

export const getAvailableRunStepPartActions = (runStepPart: RunStepPart): RunStepPartActionEnum[] => {
  // if it already failed in a previous step, nothing can be done
  if (runStepPart.part_processing_failed_in_previous_step) {
    return [];
  }

  const latestActionId = runStepPart.latest_action?.type.id;
  const actions: RunStepPartActionEnum[] = [];

  // your current conditions, just centralized:
  if (runStepPart.actions === 0) {
    actions.push(RunStepPartActionEnum.START_PROCESSING);
  }

  if (
    runStepPart.actions > 0 &&
    latestActionId !== RunStepPartActionEnum.FINISH_PROCESSING &&
    latestActionId !== RunStepPartActionEnum.FAILED_PROCESSING
  ) {
    actions.push(RunStepPartActionEnum.FINISH_PROCESSING, RunStepPartActionEnum.FAILED_PROCESSING);
  }

  if (runStepPart.actions > 0) {
    actions.push(RunStepPartActionEnum.REWORK);
  }

  return actions;
};
