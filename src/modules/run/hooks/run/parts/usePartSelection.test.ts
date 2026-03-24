import { describe, it, expect, vi } from "vitest";
import { act, render, renderHook, waitFor } from "@testing-library/react";
import { createElement, useEffect } from "react";
import { RunPart } from "@jield/solodb-typescript-core";
import { ScannerContext } from "../../../../core/contexts/scanner/ScannerContext";
import { usePartSelection, UsePartSelectionResult } from "./usePartSelection";

describe("usePartSelection", () => {
  const mockParts = [
    { id: 1, short_label: "PART-1" },
    { id: 2, short_label: "PART-2" },
    { id: 3, short_label: "PART-3" },
  ] as RunPart[];

  it("initializes with no parts selected", () => {
    const { result } = renderHook(() =>
      usePartSelection({
        parts: mockParts,
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
    const newParts = [...mockParts, { id: 4, short_label: "PART-4" } as RunPart];
    rerender({ parts: newParts });

    // Part 1 should still be selected
    expect(result.current.selectedParts.get(1)).toBe(true);
    // New part should be unselected
    expect(result.current.selectedParts.get(4)).toBe(false);
  });

  it("deduplicates buffered scanned keys before applying selection", async () => {
    const bufferedPart = { id: 1, short_label: "ABC-123" } as RunPart;
    let latestResult: UsePartSelectionResult | null = null;

    const Inner = ({ parts, onChange }: { parts: RunPart[]; onChange: (result: UsePartSelectionResult) => void }) => {
      const result = usePartSelection({ parts });

      useEffect(() => {
        onChange(result);
      }, [onChange, result]);

      return null;
    };

    const Harness = ({
      parts,
      readedKeys,
      onChange,
    }: {
      parts: RunPart[];
      readedKeys: string;
      onChange: (result: UsePartSelectionResult) => void;
    }) =>
      createElement(
        ScannerContext.Provider,
        {
          value: {
            readedKeys,
            readingKeys: "",
            addCallbackFn: vi.fn(),
            removeCallbackFn: vi.fn(),
          },
        },
        createElement(Inner, { parts, onChange })
      );

    const onChange = vi.fn((result: UsePartSelectionResult) => {
      latestResult = result;
    });

    const { rerender } = render(
      createElement(Harness, {
        parts: [],
        readedKeys: "abc_123",
        onChange,
      })
    );

    rerender(
      createElement(Harness, {
        parts: [],
        readedKeys: "ignored",
        onChange,
      })
    );

    rerender(
      createElement(Harness, {
        parts: [],
        readedKeys: "abc_123",
        onChange,
      })
    );

    rerender(
      createElement(Harness, {
        parts: [bufferedPart],
        readedKeys: "abc_123",
        onChange,
      })
    );

    await waitFor(() => {
      expect(latestResult?.selectedParts.get(1)).toBe(true);
    });
  });
});
