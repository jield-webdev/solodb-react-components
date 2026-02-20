import { useCallback, useEffect, useImperativeHandle, useState } from "react";

export interface UsePartSelectionOptions<T> {
  parts: T[];
  getPartId: (part: T) => number;
  toggleRef?: React.Ref<{
    setPart: (part: number) => void;
    setPartByLabel?: (label: string) => void;
  } | null>;
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
 * @param options Configuration object with parts array, ID getter, and optional ref
 * @returns Object with selection state and control functions
 */
export function usePartSelection<T>({
  parts,
  getPartId,
  toggleRef,
}: UsePartSelectionOptions<T>): UsePartSelectionResult {
  const [selectedParts, setSelectedParts] = useState<Map<number, boolean>>(new Map<number, boolean>());

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

  // Expose setPart function to parent component via ref
  useImperativeHandle<
    {
      setPart: (part: number) => void;
      setPartByLabel?: (label: string) => void;
    } | null,
    {
      setPart: (part: number) => void;
      setPartByLabel?: (label: string) => void;
    } | null
  >(toggleRef, () => {
    if (parts.length === 0) return null;
    console.log(parts);

    return {
      setPart(part: number) {
        setPartAsSelected(part);
      },
      setPartByLabel(label: string) {
        const part = (parts.find((p) => (p as any)?.short_label === label) as any)?.id;
        if (part !== undefined) setPartAsSelected(part);
      },
    };
  }, [parts, setPartAsSelected]);

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
