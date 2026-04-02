import { useCallback, useEffect, useId } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  performRunStepPartAction,
  RunStepPartActionEnum,
  RunStepPart,
  RunStep,
  RunPart,
  getAvailableRunStepPartActions,
  actionLabelToEnum,
  actionEnumToName,
} from "@jield/solodb-typescript-core";
import { updateRunStepPartCache } from "@jield/solodb-react-components/modules/run/utils/runStepPartCache";
import { useScannerContext } from "@jield/solodb-react-components/modules/core/contexts/scanner/ScannerContext";
import { PERFORM_ACTION_TRIGER, ScannedKeysType } from "../../../utils/parseScannerForRun";
import { notification } from "@jield/solodb-react-components/utils/notification";

export interface UsePartActionsOptions {
  runStep: RunStep;
  parts: RunStepPart[] | RunPart[];
  selectedParts: Map<number, boolean>;
  getRunPart?: (part: RunStepPart) => number;
  getRunStepPart?: (part: RunPart) => RunStepPart | undefined;
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
export function usePartActions({
  runStep,
  parts,
  selectedParts,
  getRunPart,
  getRunStepPart,
  refetchFn,
  actionsFromScanner = true,
}: UsePartActionsOptions): UsePartActionsResult {
  const queryClient = useQueryClient();

  // read keys from the scanner
  const { addCallbackFn, removeCallbackFn } = useScannerContext();
  const callbackId = useId();

  // Helper to determine if we're working with RunStepPart or RunPart
  const isRunStepPart = (part: RunStepPart | RunPart): part is RunStepPart => {
    return 'step_id' in part && 'part_id' in part;
  };

  const performActionToSelectedParts = useCallback(
    (action: RunStepPartActionEnum) => {
      let selectedItems: (RunStepPart | RunPart)[] = [];

      // Filter selected parts based on their type
      if (parts.length > 0 && isRunStepPart(parts[0])) {
        // Working with RunStepPart[]
        // In this case, we need getRunPart to map to the actual RunPart ID
        selectedItems = (parts as RunStepPart[]).filter((part) => {
          const partId = getRunPart ? getRunPart(part) : part.part_id;
          return selectedParts.get(partId);
        });
      } else {
        // Working with RunPart[]
        selectedItems = (parts as RunPart[]).filter((part) => selectedParts.get(part.id));
      }

      if (selectedItems.length === 0) {
        return;
      }

      const promises: Promise<void>[] = [];

      for (const item of selectedItems) {
        let runStepPart: RunStepPart | undefined;
        let runPart: RunPart | undefined;

        if (isRunStepPart(item)) {
          // We have a RunStepPart but need a RunPart for getAvailableRunStepPartActions
          runStepPart = item;
          // Since we can't get the actual RunPart when working with RunStepPart[],
          // we'll check if the part has the failed flag from previous step
          runPart = {
            id: getRunPart ? getRunPart(item) : item.part_id,
            part_processing_failed: item.part_processing_failed_in_previous_step || false
          } as RunPart;
        } else {
          // We have a RunPart and need to find the corresponding RunStepPart
          runPart = item;
          runStepPart = getRunStepPart ? getRunStepPart(item) : undefined;
        }

        if (runStepPart && runPart) {
          const availableActions = getAvailableRunStepPartActions(runStepPart);
          if (availableActions.includes(action)) {
            promises.push(
              performRunStepPartAction(runStepPart, action, runStep).then((latestAction) => {
                updateRunStepPartCache(queryClient, {
                  runStepPart,
                  action,
                  latestAction: latestAction as RunStepPart["latest_action"],
                });
              })
            );
          }
        }
      }

      Promise.all(promises).then(() => {
        queryClient.refetchQueries({ queryKey: ["stepParts", runStep.id] });
        queryClient.refetchQueries({ queryKey: ["runStepParts", runStep.id] });
        if (refetchFn) {
          refetchFn();
        }
      });
    },
    [parts, selectedParts, getRunPart, getRunStepPart, queryClient, runStep.id, refetchFn]
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
    let selectedItems: (RunStepPart | RunPart)[] = [];

    // Filter selected parts based on their type
    if (parts.length > 0 && isRunStepPart(parts[0])) {
      // Working with RunStepPart[]
      selectedItems = (parts as RunStepPart[]).filter((part) => {
        const partId = getRunPart ? getRunPart(part) : part.part_id;
        return selectedParts.get(partId);
      });
    } else {
      // Working with RunPart[]
      selectedItems = (parts as RunPart[]).filter((part) => selectedParts.get(part.id));
    }

    if (selectedItems.length === 0) {
      return new Set();
    }

    const actionSet = new Set<RunStepPartActionEnum>();

    selectedItems.forEach((item) => {
      let runStepPart: RunStepPart | undefined;
      let runPart: RunPart | undefined;

      if (isRunStepPart(item)) {
        // We have a RunStepPart but need a RunPart for getAvailableRunStepPartActions
        runStepPart = item;
        // Since we can't get the actual RunPart when working with RunStepPart[],
        // we'll check if the part has the failed flag from previous step
        runPart = {
          id: getRunPart ? getRunPart(item) : item.part_id,
          part_processing_failed: item.part_processing_failed_in_previous_step || false
        } as RunPart;
      } else {
        // We have a RunPart and need to find the corresponding RunStepPart
        runPart = item;
        runStepPart = getRunStepPart ? getRunStepPart(item) : undefined;
      }

      if (runStepPart && runPart) {
        const actionsForPart = getAvailableRunStepPartActions(runStepPart);
        actionsForPart.forEach((action) => actionSet.add(action));
      }
    });

    return actionSet;
  }, [parts, selectedParts, getRunPart, getRunStepPart]);

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
