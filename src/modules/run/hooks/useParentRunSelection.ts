import { type Run } from "@jield/solodb-typescript-core";
import { useCallback, useMemo, useState } from "react";

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

const emptyPartIds: number[] = [];
const emptyPartIdSet = new Set<number>();

// Replaces the part ids of one run, keeping the previous object when nothing
// changed so React state updates are skipped. Runs without parts are removed
// from the record entirely.
const replaceRunPartIds = (
  current: Record<number, number[]>,
  runId: number,
  partIds: number[]
): Record<number, number[]> => {
  const currentPartIds = current[runId] ?? [];
  const hasSamePartIds =
    currentPartIds.length === partIds.length && currentPartIds.every((partId, index) => partId === partIds[index]);

  if (hasSamePartIds) {
    return current;
  }

  if (partIds.length === 0 && !(runId in current)) {
    return current;
  }

  const next = { ...current };
  if (partIds.length > 0) {
    next[runId] = partIds;
  } else {
    delete next[runId];
  }
  return next;
};

const removeRunEntry = <T>(current: Record<number, T>, runId: number): Record<number, T> => {
  if (!(runId in current)) {
    return current;
  }

  const next = { ...current };
  delete next[runId];
  return next;
};

/**
 * State for selecting parent runs together with their parts, experimental
 * split amounts and descriptions. Shared by the new-run wizard and the
 * edit-run-parents view.
 */
export function useParentRunSelection(): ParentRunSelection {
  const [selectedRuns, setSelectedRuns] = useState<Run[]>([]);
  const [partIdsByRunId, setPartIdsByRunId] = useState<Record<number, number[]>>({});
  const [amountPerPartByRunId, setAmountPerPartByRunId] = useState<Record<number, Record<number, number>>>({});
  const [descriptionsByRunId, setDescriptionsByRunId] = useState<Record<number, string>>({});

  const partIdSetsByRunId = useMemo(() => {
    const sets: Record<number, Set<number>> = {};

    for (const [runId, partIds] of Object.entries(partIdsByRunId)) {
      sets[Number(runId)] = new Set(partIds);
    }

    return sets;
  }, [partIdsByRunId]);

  const selectRun = useCallback((run: Run) => {
    setSelectedRuns((current) =>
      current.some((selectedRun) => selectedRun.id === run.id) ? current : [...current, run]
    );
  }, []);

  const deselectRun = useCallback((runId: number) => {
    setSelectedRuns((current) => current.filter((run) => run.id !== runId));
    setPartIdsByRunId((current) => replaceRunPartIds(current, runId, []));
    setAmountPerPartByRunId((current) => removeRunEntry(current, runId));
    setDescriptionsByRunId((current) => removeRunEntry(current, runId));
  }, []);

  const getSelectedPartIds = useCallback(
    (runId: number): number[] => partIdsByRunId[runId] ?? emptyPartIds,
    [partIdsByRunId]
  );

  const isPartSelected = useCallback(
    (runId: number, partId: number): boolean => (partIdSetsByRunId[runId] ?? emptyPartIdSet).has(partId),
    [partIdSetsByRunId]
  );

  const setRunPartIds = useCallback((runId: number, partIds: number[]) => {
    setPartIdsByRunId((current) => replaceRunPartIds(current, runId, partIds));
  }, []);

  const togglePart = useCallback((runId: number, partId: number) => {
    setPartIdsByRunId((current) => {
      const currentPartIds = current[runId] ?? [];
      const nextPartIds = currentPartIds.includes(partId)
        ? currentPartIds.filter((id) => id !== partId)
        : [...currentPartIds, partId];
      return replaceRunPartIds(current, runId, nextPartIds);
    });
  }, []);

  const setPartsSelected = useCallback((runId: number, partIds: number[], selected: boolean) => {
    setPartIdsByRunId((current) => {
      const currentPartIds = current[runId] ?? [];
      let nextPartIds: number[];

      if (selected) {
        const merged = new Set(currentPartIds);
        partIds.forEach((partId) => merged.add(partId));
        nextPartIds = [...merged];
      } else {
        const removedIds = new Set(partIds);
        nextPartIds = currentPartIds.filter((partId) => !removedIds.has(partId));
      }

      return replaceRunPartIds(current, runId, nextPartIds);
    });
  }, []);

  const getPartAmount = useCallback(
    (runId: number, partId: number): number => amountPerPartByRunId[runId]?.[partId] ?? 1,
    [amountPerPartByRunId]
  );

  const setPartAmount = useCallback((runId: number, partId: number, amount: number) => {
    const sanitizedAmount = Number.isFinite(amount) ? Math.max(1, amount) : 1;
    setAmountPerPartByRunId((current) => {
      if ((current[runId]?.[partId] ?? 1) === sanitizedAmount) {
        return current;
      }

      return {
        ...current,
        [runId]: {
          ...(current[runId] ?? {}),
          [partId]: sanitizedAmount,
        },
      };
    });
  }, []);

  const setDescription = useCallback((runId: number, description: string) => {
    setDescriptionsByRunId((current) => {
      if ((current[runId] ?? "") === description) {
        return current;
      }

      if (!description && !(runId in current)) {
        return current;
      }

      const next = { ...current };
      if (description) {
        next[runId] = description;
      } else {
        delete next[runId];
      }
      return next;
    });
  }, []);

  return {
    selectedRuns,
    partIdsByRunId,
    amountPerPartByRunId,
    descriptionsByRunId,
    selectRun,
    deselectRun,
    getSelectedPartIds,
    isPartSelected,
    setRunPartIds,
    togglePart,
    setPartsSelected,
    getPartAmount,
    setPartAmount,
    setDescription,
  };
}
