import { ScannerContext } from "@jield/solodb-react-components/modules/core/contexts/scanner/ScannerContext";
import { useCallback, useContext, useEffect, useImperativeHandle, useState } from "react";

export interface UsePartSelectionOptions<T> {
  parts: T[];
  getPartId: (part: T) => number;
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
export function usePartSelection<T>({ parts, getPartId }: UsePartSelectionOptions<T>): UsePartSelectionResult {
  const [selectedParts, setSelectedParts] = useState<Map<number, boolean>>(new Map<number, boolean>());
  // TODO: lisen for part selection via ScannerProvider
  const { readedKeys, readingKeys } = useContext(ScannerContext);

  useEffect(() => {
    console.log(readedKeys);
  }, [readedKeys]);

  useEffect(() => {
    console.log(readingKeys);
  }, [readingKeys]);

  // Update selection map when parts change
  useEffect(() => {
    // first check if there is a need to update
    const newMap = new Map<number, boolean>();
    for (const part of parts) {
      const id = getPartId(part);
      newMap.set(id, selectedParts.get(id) ?? false);
    }
    if (newMap.size !== selectedParts.size) {
      setSelectedParts(() => {
        return newMap;
      });
    }
  }, [parts, getPartId]);

  const setPartAsSelected = useCallback((partID: number) => {
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
