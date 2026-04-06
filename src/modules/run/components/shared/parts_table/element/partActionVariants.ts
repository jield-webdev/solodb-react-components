import { RunStepPartActionEnum } from "@jield/solodb-typescript-core";

export const ACTION_VARIANT: Record<RunStepPartActionEnum, string> = {
  [RunStepPartActionEnum.START]: "btn-primary",
  [RunStepPartActionEnum.FINISH]: "btn-success",
  [RunStepPartActionEnum.FAIL]: "btn-danger",
  [RunStepPartActionEnum.REWORK]: "btn-info",
  [RunStepPartActionEnum.SET_REPAIR]: "btn-warning",
  [RunStepPartActionEnum.CLEAR_REPAIR]: "btn-warning",
  [RunStepPartActionEnum.SET_TESTING]: "btn-dark",
  [RunStepPartActionEnum.CLEAR_TESTING]: "btn-dark",
};
