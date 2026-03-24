import { ScannerContext, useScannerContext } from "@jield/solodb-react-components/modules/core/contexts/scanner/ScannerContext";
import { notification } from "@jield/solodb-react-components/utils/notification";
import { RunPart, RunStepPart } from "@jield/solodb-typescript-core";
import { useCallback, useContext, useEffect, useId, useRef, useState } from "react";

export interface UsePartSelectionOptions {
  parts: RunPart[] | RunStepPart[];
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
 * @param options Configuration object with parts array, ID getter
 * @returns Object with selection state and control functions
 */
export function usePartSelection({ parts }: UsePartSelectionOptions): UsePartSelectionResult {
  const [selectedParts, setSelectedParts] = useState<Map<number, boolean>>(new Map<number, boolean>());

  // read keys from the scanner
  const { readedKeys, addCallbackFn, removeCallbackFn } = useScannerContext();
  const callbackId = useId();

  //buffer to keep scanned keys if parts is empty
  const scannedKeysBuffer = useRef<Set<string>>(new Set<string>());

  // ref so the registered callback always sees the latest parts/setPartAsSelected
  const onScanReadsKeysRef = useRef<(keys: string) => void>(() => {});

  onScanReadsKeysRef.current = (keys: string) => {
    const normalizedRead = keys.replace(/_/g, "-").toUpperCase();

    if (parts.length == 0) {
      if (scannedKeysBuffer.current.size >= 15) {
        const firstKey = scannedKeysBuffer.current.values().next().value;
        if (firstKey !== undefined) {
          scannedKeysBuffer.current.delete(firstKey);
        }
      }

      scannedKeysBuffer.current.add(normalizedRead);
      // to make sure it doesnt get to big
      return;
    }

    const foundPart = parts.find((p) =>
      normalizedRead.includes(p?.short_label ? p?.short_label : p?.part?.short_label)
    );

    if (!foundPart) { 
        notification({notificationHeader: "Part scanner", notificationBody: "Part not found", notificationType: "danger"});
        return 
    };

    setPartAsSelected(foundPart.id);
  };

  useEffect(() => {
    onScanReadsKeysRef.current(readedKeys);
    addCallbackFn(callbackId, (keys) => onScanReadsKeysRef.current(keys));

    return () => {
      removeCallbackFn(callbackId);
    };
  }, []);

  // Update selection map when parts change
  useEffect(() => {
    // first check if there is a need to update
    const newMap = new Map<number, boolean>();
    for (const part of parts) {
      const id = part.id;
      newMap.set(id, selectedParts.get(id) ?? false);
    }
    if (newMap.size !== selectedParts.size) {
      setSelectedParts(() => {
        return newMap;
      });
    }

    // process the scannedKeysBuffer
    if (parts.length > 0) {
      scannedKeysBuffer.current.forEach((keys) => {
        const foundPart = parts.find((p) =>
          keys
            .replace(/_/g, "-")
            .toUpperCase()
            .includes(p?.short_label ? p?.short_label : p?.part?.short_label)
        );

        if (foundPart) {
            setPartAsSelected(foundPart.id);
        }
      });

      scannedKeysBuffer.current.clear();
    }
  }, [parts]);

  const setPartAsSelected = useCallback((partID: number) => {
    notification({notificationHeader: "Part scanner", notificationBody: `Found part: ${partID}`, notificationType: "success"});
    setSelectedParts((prev) => {
      const next = new Map(prev);
      next.set(partID, !(prev.get(partID) ?? false));
      return next;
    });
  }, []);

  const selectAllParts = useCallback(() => {
    setSelectedParts((prev) => new Map([...prev.keys()].map((key) => [key, true])));
  }, []);

  const selectNoneParts = useCallback(() => {
    setSelectedParts((prev) => new Map([...prev.keys()].map((key) => [key, false])));
  }, []);

  const hasSelectedParts = Array.from(selectedParts.values()).some((selected) => selected);

  return {
    selectedParts,
    setPartAsSelected,
    selectAllParts,
    selectNoneParts,
    hasSelectedParts,
  };
}
