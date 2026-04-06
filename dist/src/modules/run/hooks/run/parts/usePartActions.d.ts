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
    getAvailableActionsForSelection: () => Set<RunStepPartActionEnum>;
}
/**
 * Hook for managing bulk actions on selected parts
 *
 * @param options Configuration object with parts, selection state, and action mappings
 * @returns Functions for performing and querying available actions
 */
export declare function usePartActions({ runStep, parts, selectedParts, getRunPart, getRunStepPart, actionsFromScanner, }: UsePartActionsOptions): UsePartActionsResult;
