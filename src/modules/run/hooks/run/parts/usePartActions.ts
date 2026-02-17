import { useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  RunStepPartActionEnum,
  setRunStepPartAction,
  RunStepPart,
  RunStep,
  getAvailableRunStepPartActions,
} from "@jield/solodb-typescript-core";

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
export function usePartActions<T>({
  runStep,
  parts,
  selectedParts,
  getPartId,
  getRunStepPart,
  refetchFn,
}: UsePartActionsOptions<T>): UsePartActionsResult {
  const queryClient = useQueryClient();

  const performActionToSelectedParts = useCallback(
    (action: RunStepPartActionEnum) => {
      const selectedItems = parts.filter((part) => selectedParts.get(getPartId(part)));

      if (selectedItems.length === 0) {
        return;
      }

      const promises = selectedItems
        .map((item) => getRunStepPart(item))
        .filter((runStepPart): runStepPart is RunStepPart => runStepPart !== undefined)
        .filter((runStepPart) =>
          getAvailableRunStepPartActions(runStepPart).some((a) => a === action)
        )
        .map((runStepPart) =>
          setRunStepPartAction({ runStepPart, runStepPartAction: action })
        );

      Promise.all(promises).then(() => {
        queryClient.refetchQueries({ queryKey: ["stepParts", runStep.id] });
        queryClient.refetchQueries({ queryKey: ["runStepParts", runStep.id] });
        if (refetchFn) {
          refetchFn();
        }
      });
    },
    [parts, selectedParts, getPartId, getRunStepPart, queryClient, runStep.id, refetchFn]
  );

  const getAvailableActionsForSelection = useCallback((): Set<RunStepPartActionEnum> => {
    const selectedItems = parts.filter((part) => selectedParts.get(getPartId(part)));

    if (selectedItems.length === 0) {
      return new Set();
    }

    const actionSet = new Set<RunStepPartActionEnum>();

    selectedItems.forEach((item) => {
      const runStepPart = getRunStepPart(item);
      if (runStepPart) {
        const actionsForPart = getAvailableRunStepPartActions(runStepPart);
        actionsForPart.forEach((action) => actionSet.add(action));
      }
    });

    return actionSet;
  }, [parts, selectedParts, getPartId, getRunStepPart]);

  return {
    performActionToSelectedParts,
    getAvailableActionsForSelection,
  };
}
