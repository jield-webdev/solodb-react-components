import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { usePartActions } from "./usePartActions";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  RunStepPartActionEnum,
  getAvailableRunStepPartActions,
  setRunStepPartAction,
  RunStepPart,
  RunStep,
} from "@jield/solodb-typescript-core";
import { ReactNode } from "react";

// Mock the core library functions
vi.mock("@jield/solodb-typescript-core", async () => {
  const actual = await vi.importActual("@jield/solodb-typescript-core");
  return {
    ...actual,
    getAvailableRunStepPartActions: vi.fn(),
    setRunStepPartAction: vi.fn(),
  };
});

interface MockPart {
  id: number;
  stepPartId?: number;
}

describe("usePartActions", () => {
  let queryClient: QueryClient;

  const mockRunStep = { id: 100 } as RunStep;

  const mockParts: MockPart[] = [
    { id: 1, stepPartId: 10 },
    { id: 2, stepPartId: 20 },
    { id: 3, stepPartId: 30 },
  ];

  const mockRunStepParts: RunStepPart[] = [
    { id: 10, part: { id: 1 } } as RunStepPart,
    { id: 20, part: { id: 2 } } as RunStepPart,
    { id: 30, part: { id: 3 } } as RunStepPart,
  ];

  const getPartId = (part: MockPart) => part.id;
  const getRunStepPart = (part: MockPart) =>
    mockRunStepParts.find((sp) => sp.id === part.stepPartId);

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });
    vi.clearAllMocks();
  });

  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  it("returns empty set when no parts are selected", () => {
    const selectedParts = new Map<number, boolean>([
      [1, false],
      [2, false],
      [3, false],
    ]);

    const { result } = renderHook(
      () =>
        usePartActions({
          runStep: mockRunStep,
          parts: mockParts,
          selectedParts,
          getPartId,
          getRunStepPart,
        }),
      { wrapper }
    );

    const actions = result.current.getAvailableActionsForSelection();
    expect(actions.size).toBe(0);
  });

  it("aggregates available actions from selected parts", () => {
    const selectedParts = new Map<number, boolean>([
      [1, true],
      [2, true],
      [3, false],
    ]);

    vi.mocked(getAvailableRunStepPartActions).mockImplementation((part) => {
      if (part.id === 10) return [RunStepPartActionEnum.START_PROCESSING];
      if (part.id === 20)
        return [
          RunStepPartActionEnum.START_PROCESSING,
          RunStepPartActionEnum.FINISH_PROCESSING,
        ];
      return [];
    });

    const { result } = renderHook(
      () =>
        usePartActions({
          runStep: mockRunStep,
          parts: mockParts,
          selectedParts,
          getPartId,
          getRunStepPart,
        }),
      { wrapper }
    );

    const actions = result.current.getAvailableActionsForSelection();
    expect(actions.size).toBe(2);
    expect(actions.has(RunStepPartActionEnum.START_PROCESSING)).toBe(true);
    expect(actions.has(RunStepPartActionEnum.FINISH_PROCESSING)).toBe(true);
  });

  it("performs action only on selected parts with that action available", async () => {
    const selectedParts = new Map<number, boolean>([
      [1, true],
      [2, true],
      [3, false],
    ]);

    vi.mocked(getAvailableRunStepPartActions).mockImplementation((part) => {
      if (part.id === 10) return [RunStepPartActionEnum.START_PROCESSING];
      if (part.id === 20) return []; // Part 2 doesn't have START_PROCESSING
      return [];
    });

    vi.mocked(setRunStepPartAction).mockResolvedValue({} as any);

    const refetchFn = vi.fn();

    const { result } = renderHook(
      () =>
        usePartActions({
          runStep: mockRunStep,
          parts: mockParts,
          selectedParts,
          getPartId,
          getRunStepPart,
          refetchFn,
        }),
      { wrapper }
    );

    act(() => {
      result.current.performActionToSelectedParts(RunStepPartActionEnum.START_PROCESSING);
    });

    await waitFor(() => {
      // Should only be called once for part 1 (part 2 doesn't have the action)
      expect(setRunStepPartAction).toHaveBeenCalledTimes(1);
      expect(setRunStepPartAction).toHaveBeenCalledWith({
        runStepPart: mockRunStepParts[0],
        runStepPartAction: RunStepPartActionEnum.START_PROCESSING,
      });
    });

    await waitFor(() => {
      expect(refetchFn).toHaveBeenCalled();
    });
  });

  it("invalidates both stepParts and runStepParts queries after action", async () => {
    const selectedParts = new Map<number, boolean>([[1, true]]);

    vi.mocked(getAvailableRunStepPartActions).mockReturnValue([
      RunStepPartActionEnum.FINISH_PROCESSING,
    ]);
    vi.mocked(setRunStepPartAction).mockResolvedValue({} as any);

    const refetchQueriesSpy = vi.spyOn(queryClient, "refetchQueries");

    const { result } = renderHook(
      () =>
        usePartActions({
          runStep: mockRunStep,
          parts: mockParts,
          selectedParts,
          getPartId,
          getRunStepPart,
        }),
      { wrapper }
    );

    act(() => {
      result.current.performActionToSelectedParts(RunStepPartActionEnum.FINISH_PROCESSING);
    });

    await waitFor(() => {
      expect(refetchQueriesSpy).toHaveBeenCalledWith({
        queryKey: ["stepParts", mockRunStep.id],
      });
      expect(refetchQueriesSpy).toHaveBeenCalledWith({
        queryKey: ["runStepParts", mockRunStep.id],
      });
    });
  });

  it("handles parts without RunStepPart gracefully", () => {
    const partsWithoutStepPart: MockPart[] = [{ id: 99 }]; // No stepPartId

    const selectedParts = new Map<number, boolean>([[99, true]]);

    const { result } = renderHook(
      () =>
        usePartActions({
          runStep: mockRunStep,
          parts: partsWithoutStepPart,
          selectedParts,
          getPartId,
          getRunStepPart,
        }),
      { wrapper }
    );

    // Should return empty set (no RunStepPart means no actions)
    const actions = result.current.getAvailableActionsForSelection();
    expect(actions.size).toBe(0);

    // Should not throw when trying to perform action
    act(() => {
      result.current.performActionToSelectedParts(RunStepPartActionEnum.START_PROCESSING);
    });

    expect(setRunStepPartAction).not.toHaveBeenCalled();
  });

  it("does nothing when no parts are selected", async () => {
    const selectedParts = new Map<number, boolean>([
      [1, false],
      [2, false],
    ]);

    const refetchFn = vi.fn();

    const { result } = renderHook(
      () =>
        usePartActions({
          runStep: mockRunStep,
          parts: mockParts,
          selectedParts,
          getPartId,
          getRunStepPart,
          refetchFn,
        }),
      { wrapper }
    );

    act(() => {
      result.current.performActionToSelectedParts(RunStepPartActionEnum.START_PROCESSING);
    });

    // Wait a bit to ensure no async calls happen
    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(setRunStepPartAction).not.toHaveBeenCalled();
    expect(refetchFn).not.toHaveBeenCalled();
  });
});
