import { QueryClient } from "@tanstack/react-query";
import { listRunStepParts, RunPart, RunStep, RunStepPart, RunStepPartState } from "@jield/solodb-typescript-core";

type UpdateRunStepPartCacheOptions = {
  runStepPart: RunStepPart;
  latestAction: RunStepPartState;
};

// --- Item transformers ---

const applyActionToRunStepPart = (runStepPart: RunStepPart, latestAction: RunStepPartState): RunStepPart => {
  const { status, processed, failed, started, available_actions } = latestAction.updated_run_step_part_state;
  return { ...runStepPart, status, processed, failed, started, available_actions };
};

// --- Data shape helpers ---

// Queries store items either as { items: [...] } (regular) or { pages: [{ items: [...] }, ...] } (infinite).
// This helper abstracts over both formats so callers only need to supply an items transform.
const mapOverItems = (data: any, transform: (items: RunStepPart[]) => RunStepPart[]): any => {
  if (!data) return data;

  if (Array.isArray(data.pages)) {
    return {
      ...data,
      pages: data.pages.map((page: any) => {
        if (!page || !Array.isArray(page.items)) return page;
        return { ...page, items: transform(page.items as RunStepPart[]) };
      }),
    };
  }

  if (Array.isArray(data.items)) {
    return { ...data, items: transform(data.items as RunStepPart[]) };
  }

  return data;
};

// --- Cache data transformers ---

const applyOptimisticUpdate = (data: any, options: UpdateRunStepPartCacheOptions): any => {
  const { runStepPart, latestAction } = options;
  return mapOverItems(data, (items) =>
    items.map((item) => (item.id === runStepPart.id ? applyActionToRunStepPart(item, latestAction) : item))
  );
};

const applyBatchUpdate = (data: any, updatesById: Map<number, RunStepPart>): any =>
  mapOverItems(data, (items) => items.map((item) => updatesById.get(item.id) ?? item));

const upsertRunStepPartInData = (data: any, runStepPart: RunStepPart): any => {
  if (!data) return data;

  if (Array.isArray(data.pages)) {
    const pages = data.pages as any[];
    const existsInAnyPage = pages.some(
      (page) => Array.isArray(page?.items) && page.items.some((item: RunStepPart) => item.id === runStepPart.id)
    );

    if (existsInAnyPage) {
      return mapOverItems(data, (items) => items.map((item) => (item.id === runStepPart.id ? runStepPart : item)));
    }

    // Append to last page if not found in any page
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

// --- Cache operations ---

const refreshRunStepPartCacheForRunPart = async (queryClient: QueryClient, runStepPart: RunStepPart): Promise<void> => {
  const result = await listRunStepParts({ runPart: { id: runStepPart.part_id } as RunPart });
  const updatesById = new Map(result.items.map((item) => [item.id, item]));

  if (updatesById.size === 0) return;

  queryClient.setQueriesData({ queryKey: ["runStepParts"] }, (data) => applyBatchUpdate(data, updatesById));
};

const updateRunStepPartCacheInternal = (queryClient: QueryClient, options: UpdateRunStepPartCacheOptions): void => {
  // Apply optimistic update immediately, then reconcile with fresh server data
  queryClient.setQueriesData({ queryKey: ["runStepParts"] }, (data) => applyOptimisticUpdate(data, options));

  void refreshRunStepPartCacheForRunPart(queryClient, options.runStepPart).catch((error) => {
    console.error("Failed to refresh run step part cache from run part.", error);
  });
};

// --- Exports ---

export const updateRunStepPartCache = (queryClient: QueryClient, options: UpdateRunStepPartCacheOptions): void => {
  updateRunStepPartCacheInternal(queryClient, options);
};

export const updateRunStepPartCacheByRunStep = (
  queryClient: QueryClient,
  runStep: RunStep,
  options: UpdateRunStepPartCacheOptions
): void => {
  updateRunStepPartCacheInternal(queryClient, options);
};

export const upsertRunStepPartCache = (queryClient: QueryClient, runStep: RunStep, runStepPart: RunStepPart): void => {
  queryClient.setQueriesData({ queryKey: ["runStepParts"] }, (data) => upsertRunStepPartInData(data, runStepPart));
};
