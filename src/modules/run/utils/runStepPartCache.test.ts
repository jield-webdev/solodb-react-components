import { QueryClient } from "@tanstack/react-query";
import { describe, expect, it } from "vitest";
import { RunStep, RunStepPart } from "@jield/solodb-typescript-core";
import { upsertRunStepPartCache } from "./runStepPartCache";

type RunStepPartsData = { items: RunStepPart[] };

const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

const makeStep = (overrides: Partial<RunStep>): RunStep =>
  ({
    id: 0,
    sequence: 0,
    run_id: 1,
    part_level: 0,
    ...overrides,
  }) as RunStep;

const makeStepPart = (overrides: Partial<RunStepPart>): RunStepPart =>
  ({
    id: 0,
    step_id: 0,
    part_id: 0,
    tray_id: null,
    tray_row: null,
    tray_column: null,
    date_created: "",
    status: { key: "", text: "", class: "" },
    comment: null,
    processed: false,
    failed: false,
    started: false,
    available_actions: [],
    ...overrides,
  }) as RunStepPart;

const getCachedStepPart = (queryClient: QueryClient, queryKey: readonly unknown[], id: number): RunStepPart | undefined =>
  queryClient.getQueryData<RunStepPartsData>(queryKey)?.items.find((stepPart) => stepPart.id === id);

describe("runStepPartCache", () => {
  it("updates cached subsequent level 0 step parts for the same run part when requested", () => {
    const queryClient = createQueryClient();
    const previousStep = makeStep({ id: 1, sequence: 1, run_id: 10 });
    const currentStep = makeStep({ id: 2, sequence: 2, run_id: 10 });
    const subsequentStep = makeStep({ id: 3, sequence: 3, run_id: 10 });
    const splitStep = makeStep({ id: 4, sequence: 4, run_id: 10, part_level: 1 });
    const otherRunStep = makeStep({ id: 5, sequence: 3, run_id: 20 });

    queryClient.setQueryData(["runSteps"], {
      items: [previousStep, currentStep, subsequentStep, splitStep, otherRunStep],
    });

    const previousStepPart = makeStepPart({
      id: 101,
      step_id: previousStep.id,
      part_id: 50,
      tray_id: 1,
      tray_row: 1,
      tray_column: 1,
    });
    const currentStepPart = makeStepPart({
      id: 102,
      step_id: currentStep.id,
      part_id: 50,
      tray_id: 2,
      tray_row: 2,
      tray_column: 2,
    });
    const subsequentStepPart = makeStepPart({
      id: 103,
      step_id: subsequentStep.id,
      part_id: 50,
      tray_id: 3,
      tray_row: 3,
      tray_column: 3,
    });
    const otherPart = makeStepPart({
      id: 104,
      step_id: subsequentStep.id,
      part_id: 60,
      tray_id: 4,
      tray_row: 4,
      tray_column: 4,
    });
    const splitStepPart = makeStepPart({
      id: 105,
      step_id: splitStep.id,
      part_id: 50,
      tray_id: 5,
      tray_row: 5,
      tray_column: 5,
    });
    const otherRunStepPart = makeStepPart({
      id: 106,
      step_id: otherRunStep.id,
      part_id: 50,
      tray_id: 6,
      tray_row: 6,
      tray_column: 6,
    });

    queryClient.setQueryData(["runStepParts", previousStep.id], { items: [previousStepPart] });
    queryClient.setQueryData(["runStepParts", currentStep.id], { items: [currentStepPart] });
    queryClient.setQueryData(["runStepParts", subsequentStep.id], { items: [subsequentStepPart, otherPart] });
    queryClient.setQueryData(["runStepParts", splitStep.id], { items: [splitStepPart] });
    queryClient.setQueryData(["runStepParts", otherRunStep.id], { items: [otherRunStepPart] });

    upsertRunStepPartCache(
      queryClient,
      currentStep,
      {
        ...currentStepPart,
        tray_id: 9,
        tray_row: 8,
        tray_column: 7,
      },
      { updateSubsequent: true }
    );

    expect(getCachedStepPart(queryClient, ["runStepParts", currentStep.id], currentStepPart.id)).toMatchObject({
      tray_id: 9,
      tray_row: 8,
      tray_column: 7,
    });
    expect(getCachedStepPart(queryClient, ["runStepParts", subsequentStep.id], subsequentStepPart.id)).toMatchObject({
      tray_id: 9,
      tray_row: 8,
      tray_column: 7,
    });
    expect(getCachedStepPart(queryClient, ["runStepParts", subsequentStep.id], otherPart.id)).toMatchObject({
      tray_id: 4,
      tray_row: 4,
      tray_column: 4,
    });
    expect(getCachedStepPart(queryClient, ["runStepParts", previousStep.id], previousStepPart.id)).toMatchObject({
      tray_id: 1,
      tray_row: 1,
      tray_column: 1,
    });
    expect(getCachedStepPart(queryClient, ["runStepParts", splitStep.id], splitStepPart.id)).toMatchObject({
      tray_id: 5,
      tray_row: 5,
      tray_column: 5,
    });
    expect(getCachedStepPart(queryClient, ["runStepParts", otherRunStep.id], otherRunStepPart.id)).toMatchObject({
      tray_id: 6,
      tray_row: 6,
      tray_column: 6,
    });
  });

  it("does not update cached subsequent step parts by default", () => {
    const queryClient = createQueryClient();
    const currentStep = makeStep({ id: 1, sequence: 1, run_id: 10 });
    const subsequentStep = makeStep({ id: 2, sequence: 2, run_id: 10 });
    const currentStepPart = makeStepPart({
      id: 101,
      step_id: currentStep.id,
      part_id: 50,
      tray_id: 1,
      tray_row: 1,
      tray_column: 1,
    });
    const subsequentStepPart = makeStepPart({
      id: 102,
      step_id: subsequentStep.id,
      part_id: 50,
      tray_id: 2,
      tray_row: 2,
      tray_column: 2,
    });

    queryClient.setQueryData(["runSteps"], { items: [currentStep, subsequentStep] });
    queryClient.setQueryData(["runStepParts", currentStep.id], { items: [currentStepPart] });
    queryClient.setQueryData(["runStepParts", subsequentStep.id], { items: [subsequentStepPart] });

    upsertRunStepPartCache(queryClient, currentStep, {
      ...currentStepPart,
      tray_id: 9,
      tray_row: 8,
      tray_column: 7,
    });

    expect(getCachedStepPart(queryClient, ["runStepParts", currentStep.id], currentStepPart.id)).toMatchObject({
      tray_id: 9,
      tray_row: 8,
      tray_column: 7,
    });
    expect(getCachedStepPart(queryClient, ["runStepParts", subsequentStep.id], subsequentStepPart.id)).toMatchObject({
      tray_id: 2,
      tray_row: 2,
      tray_column: 2,
    });
  });
});
