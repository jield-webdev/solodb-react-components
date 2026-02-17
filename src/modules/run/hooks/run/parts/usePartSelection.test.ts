import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { usePartSelection } from "./usePartSelection";
import { createRef } from "react";

interface MockPart {
  id: number;
  name: string;
}

describe("usePartSelection", () => {
  const mockParts: MockPart[] = [
    { id: 1, name: "Part 1" },
    { id: 2, name: "Part 2" },
    { id: 3, name: "Part 3" },
  ];

  const getPartId = (part: MockPart) => part.id;

  it("initializes with no parts selected", () => {
    const { result } = renderHook(() =>
      usePartSelection({
        parts: mockParts,
        getPartId,
      })
    );

    expect(result.current.hasSelectedParts).toBe(false);
    expect(result.current.selectedParts.get(1)).toBe(false);
    expect(result.current.selectedParts.get(2)).toBe(false);
    expect(result.current.selectedParts.get(3)).toBe(false);
  });

  it("toggles individual part selection", () => {
    const { result } = renderHook(() =>
      usePartSelection({
        parts: mockParts,
        getPartId,
      })
    );

    act(() => {
      result.current.setPartAsSelected(1);
    });

    expect(result.current.selectedParts.get(1)).toBe(true);
    expect(result.current.hasSelectedParts).toBe(true);

    // Toggle off
    act(() => {
      result.current.setPartAsSelected(1);
    });

    expect(result.current.selectedParts.get(1)).toBe(false);
    expect(result.current.hasSelectedParts).toBe(false);
  });

  it("selects all parts", () => {
    const { result } = renderHook(() =>
      usePartSelection({
        parts: mockParts,
        getPartId,
      })
    );

    act(() => {
      result.current.selectAllParts();
    });

    expect(result.current.selectedParts.get(1)).toBe(true);
    expect(result.current.selectedParts.get(2)).toBe(true);
    expect(result.current.selectedParts.get(3)).toBe(true);
    expect(result.current.hasSelectedParts).toBe(true);
  });

  it("deselects all parts", () => {
    const { result } = renderHook(() =>
      usePartSelection({
        parts: mockParts,
        getPartId,
      })
    );

    // First select all
    act(() => {
      result.current.selectAllParts();
    });

    // Then deselect all
    act(() => {
      result.current.selectNoneParts();
    });

    expect(result.current.selectedParts.get(1)).toBe(false);
    expect(result.current.selectedParts.get(2)).toBe(false);
    expect(result.current.selectedParts.get(3)).toBe(false);
    expect(result.current.hasSelectedParts).toBe(false);
  });

  it("preserves selection state when parts array changes", () => {
    const { result, rerender } = renderHook(
      ({ parts }) =>
        usePartSelection({
          parts,
          getPartId,
        }),
      {
        initialProps: { parts: mockParts },
      }
    );

    // Select part 1
    act(() => {
      result.current.setPartAsSelected(1);
    });

    expect(result.current.selectedParts.get(1)).toBe(true);

    // Add a new part
    const newParts = [...mockParts, { id: 4, name: "Part 4" }];
    rerender({ parts: newParts });

    // Part 1 should still be selected
    expect(result.current.selectedParts.get(1)).toBe(true);
    // New part should be unselected
    expect(result.current.selectedParts.get(4)).toBe(false);
  });

  it("exposes setPart via toggleRef", () => {
    const toggleRef = createRef<{ setPart: (part: number) => void } | null>();

    const { result } = renderHook(() =>
      usePartSelection({
        parts: mockParts,
        getPartId,
        toggleRef,
      })
    );

    // Access the ref and toggle part 2
    act(() => {
      toggleRef.current?.setPart(2);
    });

    expect(result.current.selectedParts.get(2)).toBe(true);
    expect(result.current.hasSelectedParts).toBe(true);
  });

  it("handles empty parts array", () => {
    const { result } = renderHook(() =>
      usePartSelection({
        parts: [],
        getPartId,
      })
    );

    expect(result.current.hasSelectedParts).toBe(false);
    expect(result.current.selectedParts.size).toBe(0);

    // Should not error when selecting all/none
    act(() => {
      result.current.selectAllParts();
      result.current.selectNoneParts();
    });

    expect(result.current.hasSelectedParts).toBe(false);
  });
});
