import { RunStepPartActionEnum, RunStepPart, RunStep, RunPart } from '@jield/solodb-typescript-core';
export interface UsePartActionsOptions {
    runStep: RunStep;
    parts: RunStepPart[] | RunPart[];
    selectedParts: Map<number, boolean>;
    getRunPart?: (part: RunStepPart) => number;
    getRunStepPart?: (part: RunPart) => RunStepPart | undefined;
    actionsFromScanner?: boolean;
}
export interface UsePartActionsResult {
    performActionToSelectedParts: (action: RunStepPartActionEnum) => void;
    getAvailableActionsForSelection: () => {
        id: RunStepPartActionEnum;
        name: string;
    }[];
}
/**
 * Hook for managing bulk actions on selected parts.
 *
 * With the new backend architecture, the frontend no longer computes which actions
 * are allowed — it reads `runStepPart.available_actions` (server-provided) directly
 * and forwards the chosen action id to `performRunStepPartAction`.
 */
export declare function usePartActions({ parts, selectedParts, getRunPart, getRunStepPart, actionsFromScanner, }: UsePartActionsOptions): UsePartActionsResult;
