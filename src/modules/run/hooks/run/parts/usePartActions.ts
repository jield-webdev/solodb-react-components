import { useCallback, useEffect, useId } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  performRunStepPartAction,
  RunStepPartActionEnum,
  RunStepPart,
  RunStep,
  getAvailableRunStepPartActions,
} from "@jield/solodb-typescript-core";
import { updateRunStepPartCache } from "@jield/solodb-react-components/modules/run/utils/runStepPartCache";
import { useScannerContext } from "@jield/solodb-react-components/modules/core/contexts/scanner/ScannerContext";
import { PERFORM_ACTION_TRIGER, ScannedKeysType } from "../../../utils/parseScannerForRun";
import { notification } from "@jield/solodb-react-components/utils/notification";
import { actionEnumToName, actionLabelToEnum } from "@jield/solodb-typescript-core";

export interface UsePartActionsOptions<T> {
  runStep: RunStep;
  parts: T[];
  selectedParts: Map<number, boolean>;
  getPartId: (part: T) => number;
  getRunStepPart: (part: T) => RunStepPart | undefined;
  refetchFn?: () => void;
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
export function usePartActions<T>({
  runStep,
  parts,
  selectedParts,
  getPartId,
  getRunStepPart,
  refetchFn,
  actionsFromScanner = true,
}: UsePartActionsOptions<T>): UsePartActionsResult {
  const queryClient = useQueryClient();

  // read keys from the scanner
  const { addCallbackFn, removeCallbackFn } = useScannerContext();
  const callbackId = useId();

  const performActionToSelectedParts = useCallback(
    (action: RunStepPartActionEnum) => {
      const selectedItems = parts.filter((part) => selectedParts.get(getPartId(part)));

      if (selectedItems.length === 0) {
        return;
      }

      const promises = selectedItems
        .map((item) => getRunStepPart(item))
        .filter((runStepPart): runStepPart is RunStepPart => runStepPart !== undefined)
        .filter((runStepPart) => getAvailableRunStepPartActions(runStepPart).some((a) => a === action))
        .map((runStepPart) =>
          performRunStepPartAction(runStepPart, action).then((latestAction) => {
            updateRunStepPartCache(queryClient, {
              runStepPart,
              action,
              latestAction: latestAction as RunStepPart["latest_action"],
            });
          })
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

  const onScanner = useCallback(
    (keys: string) => {
      // TO prevent empty values
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
        notificationBody: `Performin action ${actionEnumToName(action)} in selected parts`,
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
  }, [parts, performActionToSelectedParts]);

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

function validScannerInput(input: string) {
  // The regex pattern
  const pattern = new RegExp(`^${PERFORM_ACTION_TRIGER}/.+`);

  return pattern.test(input);
}
