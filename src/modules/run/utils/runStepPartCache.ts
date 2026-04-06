import { QueryClient } from "@tanstack/react-query";
import { listRunStepParts, RunPart, RunStep, RunStepPart, RunStepPartState } from "@jield/solodb-typescript-core";

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

const updateRunStepPartsDataById = (data: any, updatesById: Map<number, RunStepPart>) => {
  if (!data) return data;

  const updateItems = (items: RunStepPart[]) =>
    items.map((item) => {
      const updated = updatesById.get(item.id);
      return updated ?? item;
    });

  // Infinite query format: { pages: [{ items: [...] }, ...], pageParams: [...] }
  if (Array.isArray(data.pages)) {
    return {
      ...data,
      pages: data.pages.map((page: any) => {
        if (!page || !Array.isArray(page.items)) return page;
        return { ...page, items: updateItems(page.items as RunStepPart[]) };
      }),
    };
  }

  // Regular query format: { items: [...] }
  if (Array.isArray(data.items)) {
    return {
      ...data,
      items: updateItems(data.items as RunStepPart[]),
    };
  }

  return data;
};

const refreshRunStepPartCacheForRunPart = async (queryClient: QueryClient, runStepPart: RunStepPart) => {
  const runPart: RunPart = { id: runStepPart.part_id } as RunPart;
  const result = await listRunStepParts({ runPart });
  const updatesById = new Map(result.items.map((item) => [item.id, item]));

  if (updatesById.size === 0) return;

  queryClient.setQueriesData({ queryKey: ["runStepParts"] }, (data) => updateRunStepPartsDataById(data, updatesById));
};

const updateRunStepPartCacheInternal = (queryClient: QueryClient, options: UpdateRunStepPartCacheOptions) => {
  queryClient.setQueriesData({ queryKey: ["runStepParts"] }, (data) => updateRunStepPartsData(data, options));

  void refreshRunStepPartCacheForRunPart(queryClient, options.runStepPart).catch((error) => {
    console.error("Failed to refresh run step part cache from run part.", error);
  });
};

export const updateRunStepPartCache = (queryClient: QueryClient, options: UpdateRunStepPartCacheOptions) => {
  updateRunStepPartCacheInternal(queryClient, options);
};

export const updateRunStepPartCacheByRunStep = (
  queryClient: QueryClient,
  runStep: RunStep,
  options: UpdateRunStepPartCacheOptions
) => {
  updateRunStepPartCacheInternal(queryClient, options);
};

export const upsertRunStepPartCache = (queryClient: QueryClient, runStep: RunStep, runStepPart: RunStepPart) => {
  // Broad prefix covers both table-level and run-level queries.
  queryClient.setQueriesData({ queryKey: ["runStepParts"] }, (data) => upsertRunStepPartInData(data, runStepPart));
};
