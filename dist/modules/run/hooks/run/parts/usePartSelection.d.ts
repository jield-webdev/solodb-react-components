import { RunPart } from '@jield/solodb-typescript-core';
export interface UsePartSelectionOptions {
    parts: RunPart[];
}
export interface UsePartSelectionResult {
    selectedParts: Map<number, boolean>;
    setPartAsSelected: (partID: number) => void;
    setPartsSelection: (partIDs: number[], nextSelected: boolean) => void;
    selectAllParts: () => void;
    selectNoneParts: () => void;
    hasSelectedParts: boolean;
}
/**
 * Hook for managing part selection state across RunParts components
 *
 * @param options Configuration object with parts array, ID getter
 * @returns Object with selection state and control functions
 */
export declare function usePartSelection({ parts }: UsePartSelectionOptions): UsePartSelectionResult;
