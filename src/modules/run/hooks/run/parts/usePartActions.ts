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
  const { lastlyReadedKeys, addCallbackFn, removeCallbackFn } = useScannerContext();
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
      const normalizedRead = keys.replace(/_/g, "-").toUpperCase();

      // TO prevent empty values
      if (!normalizedRead) return;

      if (!validScannerInput(normalizedRead)) return;

      const parsedScanner = normalizedRead.split("/");

      const actions = [
        RunStepPartActionEnum.START_PROCESSING,
        RunStepPartActionEnum.REWORK,
        RunStepPartActionEnum.FAILED_PROCESSING,
        RunStepPartActionEnum.FINISH_PROCESSING,
      ];

      if (!actions.includes(Number(parsedScanner[2]))) {
        notification({
          notificationHeader: "Part scanner",
          notificationBody: "Non valid action found in the scanned text",
          notificationType: "danger",
        });
        return;
      }

      const action = Number(parsedScanner[2]) as RunStepPartActionEnum;

      const foundPart = parts.find((p) => parsedScanner[1].includes(p.scanner_label));

      const runStepPart = foundPart ? getRunStepPart(foundPart) : null;

      if (!runStepPart) {
        notification({
          notificationHeader: "Part scanner",
          notificationBody: "Trying to perform a action to a not found part",
          notificationType: "danger",
        });
        return;
      }

      performRunStepPartAction(runStepPart, action).then((latestAction) => {
        updateRunStepPartCache(queryClient, {
          runStepPart,
          action,
          latestAction: latestAction as RunStepPart["latest_action"],
        });
      });
    },
    [performActionToSelectedParts]
  );

  useEffect(() => {
    if (!actionsFromScanner) return;

    addCallbackFn(ScannedKeysType.PERFORM_ACTION, callbackId, onScanner);

    return () => {
      removeCallbackFn(ScannedKeysType.PERFORM_ACTION, callbackId);
    };
  }, [parts]);

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
  const pattern = RegExp(`/^${PERFORM_ACTION_TRIGER}\/.+\/\d+$/`);

  return pattern.test(input);
}
