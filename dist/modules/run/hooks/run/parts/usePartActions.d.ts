import { RunStepPartActionEnum, RunStepPart, RunStep } from '@jield/solodb-typescript-core';
export interface UsePartActionsOptions<T> {
    runStep: RunStep;
    parts: T[];
    selectedParts: Map<number, boolean>;
    getPartId: (part: T) => number;
    getRunStepPart: (part: T) => RunStepPart | undefined;
    refetchFn?: () => void;
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
export declare function usePartActions<T>({ runStep, parts, selectedParts, getPartId, getRunStepPart, refetchFn, }: UsePartActionsOptions<T>): UsePartActionsResult;
