import { RunStepPartActionEnum } from "@jield/solodb-typescript-core";

export const ACTION_VARIANT: Record<RunStepPartActionEnum, string> = {
  [RunStepPartActionEnum.START]: "btn-start",
  [RunStepPartActionEnum.FINISH]: "btn-success",
  [RunStepPartActionEnum.FAIL]: "btn-failed",
  [RunStepPartActionEnum.REWORK]: "btn-rework",
  [RunStepPartActionEnum.SET_REPAIR]: "btn-repair",
  [RunStepPartActionEnum.CLEAR_REPAIR]: "btn-secondary",
  [RunStepPartActionEnum.SET_TESTING]: "btn-test",
  [RunStepPartActionEnum.CLEAR_TESTING]: "btn-secondary",
};
