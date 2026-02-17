export interface UsePartSelectionOptions<T> {
    parts: T[];
    getPartId: (part: T) => number;
    toggleRef?: React.RefObject<{
        setPart: (part: number) => void;
    } | null>;
}
export interface UsePartSelectionResult {
    selectedParts: Map<number, boolean>;
    setPartAsSelected: (partID: number) => void;
    selectAllParts: () => void;
    selectNoneParts: () => void;
    hasSelectedParts: boolean;
}
/**
 * Hook for managing part selection state across RunParts components
 *
 * @param options Configuration object with parts array, ID getter, and optional ref
 * @returns Object with selection state and control functions
 */
export declare function usePartSelection<T>({ parts, getPartId, toggleRef, }: UsePartSelectionOptions<T>): UsePartSelectionResult;
