import { type ParentRunSelectionState } from "../hooks/useParentRunSelection";

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
export function buildRunParentPayloads(runId: number, selection: ParentRunSelectionState): RunParentPayload[] {
  return selection.selectedRuns.map((parentRun) => {
    const partIds = selection.partIdsByRunId[parentRun.id] ?? [];
    const amountByPartId = selection.amountPerPartByRunId[parentRun.id] ?? {};
    const amountPerPart =
      partIds.length > 0 ? Object.fromEntries(partIds.map((partId) => [partId, amountByPartId[partId] ?? 1])) : null;

    return {
      run_id: runId,
      parent_run_id: parentRun.id,
      part_ids: partIds,
      amount_per_part: amountPerPart,
      description: selection.descriptionsByRunId[parentRun.id] || null,
    };
  });
}
