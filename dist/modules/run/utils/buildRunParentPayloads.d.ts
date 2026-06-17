import { ParentRunSelectionState } from '../hooks/useParentRunSelection';
export type RunParentPayload = {
    run_id: number;
    parent_run_id: number;
    part_ids: number[];
    amount_per_part: Record<number, number> | null;
    description: string | null;
};
/**
 * Builds one createRunParent payload per selected parent run. Parts without an
 * explicit experimental split amount default to 1.
 */
export declare function buildRunParentPayloads(runId: number, selection: ParentRunSelectionState): RunParentPayload[];
