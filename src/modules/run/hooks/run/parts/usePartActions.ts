import { useCallback, useEffect, useId } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  performRunStepPartAction,
  performRunStepPartActions,
  RunStepPartActionEnum,
  RunStepPartStateEnum,
  RunStepPartState,
  RunStepPart,
  RunStep,
  RunPart,
  actionLabelToEnum,
  actionEnumToName,
  ApiFormattedResponse,
} from "@jield/solodb-typescript-core";
import {
  updateRunStepPartCache,
  updateRunStepPartCacheByRunStep,
} from "@jield/solodb-react-components/modules/run/utils/runStepPartCache";
import { useScannerContext } from "@jield/solodb-react-components/modules/core/contexts/scanner/ScannerContext";
import { PERFORM_ACTION_TRIGER, ScannedKeysType } from "../../../utils/parseScannerForRun";
import { notification } from "@jield/solodb-react-components/utils/notification";

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
  getAvailableActionsForSelection: () => { id: RunStepPartActionEnum; name: string }[];
}

const isRunStepPart = (part: RunStepPart | RunPart): part is RunStepPart => {
  return "step_id" in part && "part_id" in part;
};

/**
 * Hook for managing bulk actions on selected parts.
 *
 * With the new backend architecture, the frontend no longer computes which actions
 * are allowed — it reads `runStepPart.available_actions` (server-provided) directly
 * and forwards the chosen action id to `performRunStepPartAction`.
 */
export function usePartActions({
  runStep,
  parts,
  selectedParts,
  getRunPart,
  getRunStepPart,
  actionsFromScanner = true,
}: UsePartActionsOptions): UsePartActionsResult {
  const queryClient = useQueryClient();

  const { addCallbackFn, removeCallbackFn } = useScannerContext();
  const callbackId = useId();

  // Resolves the currently-selected items (from either a RunStepPart[] or RunPart[])
  // into their corresponding RunStepParts. Items without a matching RunStepPart are dropped.
  const getSelectedRunStepParts = useCallback((): RunStepPart[] => {
    if (parts.length === 0) return [];

    if (isRunStepPart(parts[0])) {
      return (parts as RunStepPart[]).filter((part) => {
        const partId = getRunPart ? getRunPart(part) : part.part_id;
        return selectedParts.get(partId);
      });
    }

    return (parts as RunPart[])
      .filter((part) => selectedParts.get(part.id))
      .map((part) => (getRunStepPart ? getRunStepPart(part) : undefined))
      .filter((stepPart): stepPart is RunStepPart => stepPart !== undefined);
  }, [parts, selectedParts, getRunPart, getRunStepPart]);

  const performActionToSelectedParts = useCallback(
    (action: RunStepPartActionEnum) => {
      const selectedStepParts = getSelectedRunStepParts();
      if (selectedStepParts.length === 0) return;

      const actionableStepParts = selectedStepParts.filter((runStepPart) =>
        runStepPart.available_actions.some(({ id }) => id === action)
      );

      if (actionableStepParts.length === 0) return;

      if (actionableStepParts.length === 1) {
        const runStepPart = actionableStepParts[0];
        void performRunStepPartAction({
          runStepPart,
          // NOTE: the core library currently types this param as `RunStepPartStateEnum`
          // even though `available_actions` entries are `RunStepPartActionEnum`.
          // The numeric value is sent as-is to the backend, so this cast is safe until
          // the core library's typing is corrected.
          runStepPartAction: action as unknown as RunStepPartStateEnum,
        }).then((latestAction: RunStepPartState) => {
          updateRunStepPartCache(queryClient, { runStepPart, latestAction });
        });
        return;
      }

      void performRunStepPartActions({
        runStepPartActions: actionableStepParts.map((runStepPart) => ({
          runStepPart,
          // NOTE: the core library currently types this param as `RunStepPartStateEnum`
          // even though `available_actions` entries are `RunStepPartActionEnum`.
          // The numeric value is sent as-is to the backend, so this cast is safe until
          // the core library's typing is corrected.
          runStepPartAction: action as unknown as RunStepPartStateEnum,
        })),
      }).then((latestActions: RunStepPartState[] | ApiFormattedResponse<RunStepPartState>) => {
        updateRunStepPartCacheByRunStep(queryClient, runStep, { latestActions });
      });
    },
    [getSelectedRunStepParts, queryClient, runStep]
  );

  const onScanner = useCallback(
    (keys: string) => {
      if (!keys) return;
      if (!validScannerInput(keys)) return;

      const parsedScanner = keys.split("/");
      const action = actionLabelToEnum(parsedScanner[1]);

      if (!action) {
        notification({
          notificationHeader: "Part scanner",
          notificationBody: "Non valid action found in the scanned text",
          notificationType: "danger",
        });
        return;
      }

      notification({
        notificationHeader: "Part scanner",
        notificationBody: `Performing action ${actionEnumToName(action)} on selected parts`,
        notificationType: "success",
      });

      performActionToSelectedParts(action);
    },
    [performActionToSelectedParts]
  );

  useEffect(() => {
    if (!actionsFromScanner) return;

    removeCallbackFn(ScannedKeysType.PERFORM_ACTION, callbackId);
    addCallbackFn(ScannedKeysType.PERFORM_ACTION, callbackId, onScanner);

    return () => {
      removeCallbackFn(ScannedKeysType.PERFORM_ACTION, callbackId);
    };
  }, [actionsFromScanner, onScanner, addCallbackFn, removeCallbackFn, callbackId]);

  const getAvailableActionsForSelection = useCallback((): { id: RunStepPartActionEnum; name: string }[] => {
    // Union of all selected parts' available_actions, deduplicated by id.
    // Names are taken from the first part that exposes each action — the server
    // returns consistent names, so all occurrences will be the same string.
    const seen = new Map<RunStepPartActionEnum, string>();

    for (const runStepPart of getSelectedRunStepParts()) {
      for (const { id, name } of runStepPart.available_actions) {
        if (!seen.has(id)) {
          seen.set(id, name);
        }
      }
    }

    return Array.from(seen.entries()).map(([id, name]) => ({ id, name }));
  }, [getSelectedRunStepParts]);

  return {
    performActionToSelectedParts,
    getAvailableActionsForSelection,
  };
}

function validScannerInput(input: string) {
  const pattern = new RegExp(`^${PERFORM_ACTION_TRIGER}/.+`);
  return pattern.test(input);
}
