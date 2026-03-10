export type IrisOperatorEventAction = "approve" | "fail" | "finish" | "reject";

export interface IrisOperatorEventActionConfig {
  action: IrisOperatorEventAction;
  buttonClassName: string;
  label: string;
  successMessage: string;
}

const ACTION_CONFIG: Record<IrisOperatorEventAction, IrisOperatorEventActionConfig> = {
  approve: {
    action: "approve",
    buttonClassName: "btn-success",
    label: "Approve",
    successMessage: "Upload approved.",
  },
  fail: {
    action: "fail",
    buttonClassName: "btn-outline-warning",
    label: "Mark as failed",
    successMessage: "Upload marked as failed.",
  },
  finish: {
    action: "finish",
    buttonClassName: "btn-primary",
    label: "Mark as finished",
    successMessage: "Upload marked as finished.",
  },
  reject: {
    action: "reject",
    buttonClassName: "btn-outline-danger",
    label: "Reject",
    successMessage: "Upload rejected.",
  },
};

const ALLOWED_ACTIONS_BY_STATE: Record<string, IrisOperatorEventAction[]> = {
  awaiting_approval: ["approve", "reject", "fail"],
  started: ["reject", "fail"],
  syncing: ["fail"],
  uploading: ["finish", "reject", "fail"],
};

export function getAllowedActionsForState(state: string): IrisOperatorEventActionConfig[] {
  const actions = ALLOWED_ACTIONS_BY_STATE[state] ?? [];
  return actions.map((action) => ACTION_CONFIG[action]);
}

export function getErrorMessage(error: unknown): string {
  if (typeof error === "object" && error !== null && "response" in error) {
    const errorResponse = (error as { response?: { data?: { message?: unknown } } }).response;
    if (typeof errorResponse?.data?.message === "string") {
      return errorResponse.data.message;
    }
  }

  if (error instanceof Error && error.message !== "") {
    return error.message;
  }

  return "Could not process upload action.";
}
