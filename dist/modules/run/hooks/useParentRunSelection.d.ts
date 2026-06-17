import { Run } from '@jield/solodb-typescript-core';
/**
 * The data slices of a parent-run selection. This is the snapshot consumers
 * pass to mutations (see buildRunParentPayloads).
 */
export interface ParentRunSelectionState {
    selectedRuns: Run[];
    partIdsByRunId: Record<number, number[]>;
    amountPerPartByRunId: Record<number, Record<number, number>>;
    descriptionsByRunId: Record<number, string>;
}
export interface ParentRunSelection extends ParentRunSelectionState {
    selectRun: (run: Run) => void;
    deselectRun: (runId: number) => void;
    getSelectedPartIds: (runId: number) => number[];
    isPartSelected: (runId: number, partId: number) => boolean;
    setRunPartIds: (runId: number, partIds: number[]) => void;
    togglePart: (runId: number, partId: number) => void;
    setPartsSelected: (runId: number, partIds: number[], selected: boolean) => void;
    getPartAmount: (runId: number, partId: number) => number;
    setPartAmount: (runId: number, partId: number, amount: number) => void;
    setDescription: (runId: number, description: string) => void;
}
/**
 * State for selecting parent runs together with their parts, experimental
 * split amounts and descriptions. Shared by the new-run wizard and the
 * edit-run-parents view.
 */
export declare function useParentRunSelection(): ParentRunSelection;
