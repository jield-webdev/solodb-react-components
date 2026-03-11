export type IrisOperatorEventAction = "approve" | "fail" | "finish" | "reject";
export interface IrisOperatorEventActionConfig {
    action: IrisOperatorEventAction;
    buttonClassName: string;
    label: string;
    successMessage: string;
}
export declare function getAllowedActionsForState(state: string): IrisOperatorEventActionConfig[];
export declare function getErrorMessage(error: unknown): string;
