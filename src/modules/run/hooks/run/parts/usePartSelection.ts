import { useScannerContext } from "@jield/solodb-react-components/modules/core/contexts/scanner/ScannerContext";
import { notification } from "@jield/solodb-react-components/utils/notification";
import { RunPart } from "@jield/solodb-typescript-core";
import { useCallback, useEffect, useId, useRef, useState } from "react";

export interface UsePartSelectionOptions {
  parts: RunPart[];
}

export interface UsePartSelectionResult {
  selectedParts: Map<number, boolean>;
  setPartAsSelected: (partID: number) => void;
  setPartsSelection: (partIDs: number[], nextSelected: boolean) => void;
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

  const setPartAsSelected = useCallback((partID: number) => {
    setSelectedParts((prev) => {
      const next = new Map(prev);
      next.set(partID, !(prev.get(partID) ?? false));
      return next;
    });
  }, []);

  // read keys from the scanner
  const { lastlyReadedKeys, addCallbackFn, removeCallbackFn } = useScannerContext();
  const callbackId = useId();

  //buffer to keep scanned keys if parts is empty
  const scannedKeysBuffer = useRef<Set<string>>(new Set<string>());

  // Update the ref whenever parts or setPartAsSelected changes
  const onScanReadsKey = useCallback(
    (keys: string) => {
      const normalizedRead = keys.replace(/_/g, "-").toUpperCase();

      // TO prevent empty values
      if (!normalizedRead) return;

      // if parts is empty add it to a buffer for processing when there is parts available
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

      const foundPart = parts.find((p) => normalizedRead.includes(p.label) || normalizedRead.includes(p.short_label));

      if (!foundPart) {
        notification({
          notificationHeader: "Part scanner",
          notificationBody: "Part not found",
          notificationType: "danger",
        });
        return;
      }

      notification({
        notificationHeader: "Part scanner",
        notificationBody: `Found part: ${foundPart.label ?? foundPart.short_label}`,
        notificationType: "success",
      });

      setPartAsSelected(foundPart.id);
    },
    [parts, setPartAsSelected]
  );

  // So when it mounts it tries to pick the lastlyReadedKeys
  useEffect(() => {
    removeCallbackFn(callbackId);
    onScanReadsKey(lastlyReadedKeys);
    addCallbackFn(callbackId, onScanReadsKey);

    return () => {
      removeCallbackFn(callbackId);
    };
  }, [parts]);

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
        onScanReadsKey(keys);
      });

      scannedKeysBuffer.current.clear();
    }
  }, [parts, selectedParts, setPartAsSelected]);

  const setPartsSelection = useCallback((partIDs: number[], nextSelected: boolean) => {
    setSelectedParts((prev) => {
      const next = new Map(prev);
      partIDs.forEach((partID) => {
        next.set(partID, nextSelected);
      });
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
    setPartsSelection,
    selectAllParts,
    selectNoneParts,
    hasSelectedParts,
  };
}
