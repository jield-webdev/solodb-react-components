import { ScannerContext } from "@jield/solodb-react-components/modules/core/contexts/scanner/ScannerContext";
import { RunPart, RunStepPart } from "@jield/solodb-typescript-core";
import { useCallback, useContext, useEffect, useState } from "react";

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
  const { readedKeys, readingKeys } = useContext(ScannerContext);
  useEffect(() => {}, [readingKeys]);

  useEffect(() => {
    const normalizedRead = readedKeys.replace(/_/g, "-").toUpperCase();

    console.log(normalizedRead);

    // @ts-ignore
    const foundPart = parts.find((p) => normalizedRead.includes(p?.short_label ? p?.short_label : p?.part?.short_label));

    if (!foundPart) return;

    setPartAsSelected(foundPart.id);
  }, [readedKeys]);

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
  }, [parts]);

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
