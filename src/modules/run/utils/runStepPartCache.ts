import { QueryClient } from "@tanstack/react-query";
import { RunStep, RunStepPart, RunStepPartState } from "@jield/solodb-typescript-core";

type UpdateRunStepPartCacheOptions = {
  runStepPart: RunStepPart;
  latestAction: RunStepPartState;
};

const applyActionToRunStepPart = (runStepPart: RunStepPart, latestAction: RunStepPartState): RunStepPart => {
  const { status, processed, failed, started, available_actions } = latestAction.updated_run_step_part_state;

  return {
    ...runStepPart,
    status,
    processed,
    failed,
    started,
    available_actions,
  };
};

const updateStepParts = (stepParts: RunStepPart[], options: UpdateRunStepPartCacheOptions): RunStepPart[] => {
  const { runStepPart, latestAction } = options;

  return stepParts.map((item) => (item.id === runStepPart.id ? applyActionToRunStepPart(item, latestAction) : item));
};

const updateRunStepPartsData = (data: any, options: UpdateRunStepPartCacheOptions) => {
  if (!data) return data;

  // Infinite query format: { pages: [{ items: [...] }, ...], pageParams: [...] }
  if (Array.isArray(data.pages)) {
    return {
      ...data,
      pages: data.pages.map((page: any) => {
        if (!page || !Array.isArray(page.items)) return page;
        return { ...page, items: updateStepParts(page.items as RunStepPart[], options) };
      }),
    };
  }

  // Regular query format: { items: [...] }
  if (Array.isArray(data.items)) {
    return {
      ...data,
      items: updateStepParts(data.items as RunStepPart[], options),
    };
  }

  return data;
};

const upsertRunStepPartInData = (data: any, runStepPart: RunStepPart) => {
  if (!data) return data;

  // Infinite query format: { pages: [{ items: [...] }, ...], pageParams: [...] }
  if (Array.isArray(data.pages)) {
    const pages = data.pages as any[];
    const existsInAnyPage = pages.some(
      (page) => Array.isArray(page?.items) && page.items.some((item: RunStepPart) => item.id === runStepPart.id)
    );

    if (existsInAnyPage) {
      return {
        ...data,
        pages: pages.map((page: any) => {
          if (!page || !Array.isArray(page.items)) return page;
          return {
            ...page,
            items: (page.items as RunStepPart[]).map((item) => (item.id === runStepPart.id ? runStepPart : item)),
          };
        }),
      };
    }

    // Append to last page
    if (pages.length > 0) {
      const lastIndex = pages.length - 1;
      return {
        ...data,
        pages: pages.map((page: any, i: number) => {
          if (i !== lastIndex || !page || !Array.isArray(page.items)) return page;
          return { ...page, items: [...page.items, runStepPart] };
        }),
      };
    }

    return data;
  }

  // Regular query format: { items: [...] }
  if (Array.isArray(data.items)) {
    const items = data.items as RunStepPart[];
    const exists = items.some((item) => item.id === runStepPart.id);

    return {
      ...data,
      items: exists ? items.map((item) => (item.id === runStepPart.id ? runStepPart : item)) : [...items, runStepPart],
    };
  }

  return data;
};

export const updateRunStepPartCache = (queryClient: QueryClient, options: UpdateRunStepPartCacheOptions) => {
  queryClient.setQueriesData({ queryKey: ["runStepParts"] }, (data) => updateRunStepPartsData(data, options));
  // queryClient.setQueriesData({ queryKey: ["stepParts"] }, (data) => updateRunStepPartsData(data, options));
};

export const updateRunStepPartCacheByRunStep = (
  queryClient: QueryClient,
  runStep: RunStep,
  options: UpdateRunStepPartCacheOptions
) => {
  // Broad prefix covers both table-level queries (["runStepParts", runStep.id])
  // and run-level queries (["runStepParts", JSON.stringify(run)]) used in runStepsElement.
  // The updater only modifies items whose id matches, so applying to all caches is safe.
  queryClient.setQueriesData({ queryKey: ["runStepParts"] }, (data) => updateRunStepPartsData(data, options));
  // queryClient.setQueriesData({ queryKey: ["stepParts", runStep.id] }, (data) => updateRunStepPartsData(data, options));
};

export const upsertRunStepPartCache = (queryClient: QueryClient, runStep: RunStep, runStepPart: RunStepPart) => {
  // Broad prefix covers both table-level and run-level queries.
  queryClient.setQueriesData({ queryKey: ["runStepParts"] }, (data) => upsertRunStepPartInData(data, runStepPart));
};
