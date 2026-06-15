import { QueryClient } from "@tanstack/react-query";
import {
  ApiFormattedResponse,
  getRunStep,
  listRunStepParts,
  RunPart,
  RunStep,
  RunStepPart,
  RunStepPartState,
} from "@jield/solodb-typescript-core";

type UpdateRunStepPartCacheOptions = {
  runStepPart: RunStepPart;
  latestAction: RunStepPartState;
};

type UpdateRunStepPartCacheByRunStepOptions =
  | UpdateRunStepPartCacheOptions
  | {
      latestActions: RunStepPartState[] | ApiFormattedResponse<RunStepPartState>;
    };

type UpsertRunStepPartCacheOptions = {
  updateSubsequent?: boolean;
};

// --- Item transformers ---

const applyActionToRunStepPart = (runStepPart: RunStepPart, latestAction: RunStepPartState): RunStepPart => {
  const { status, processed, failed, started, available_actions } = latestAction.updated_run_step_part_state;
  return { ...runStepPart, status, processed, failed, started, available_actions };
};

// --- Data shape helpers ---

// Queries store items either as { items: [...] } (regular) or { pages: [{ items: [...] }, ...] } (infinite).
// This helper abstracts over both formats so callers only need to supply an items transform.
const mapOverItems = <T>(data: any, transform: (items: T[]) => T[]): any => {
  if (!data) return data;

  if (Array.isArray(data.pages)) {
    return {
      ...data,
      pages: data.pages.map((page: any) => {
        if (!page || !Array.isArray(page.items)) return page;
        return { ...page, items: transform(page.items as T[]) };
      }),
    };
  }

  if (Array.isArray(data.items)) {
    return { ...data, items: transform(data.items as T[]) };
  }

  return data;
};

const getItemsFromData = <T>(data: any): T[] => {
  if (!data) return [];

  if (Array.isArray(data.pages)) {
    return data.pages.flatMap((page: any) => {
      if (!Array.isArray(page?.items)) return [];
      return page.items as T[];
    });
  }

  if (Array.isArray(data.items)) {
    return data.items as T[];
  }

  return [];
};

// --- Cache data transformers ---

const applyOptimisticUpdate = (data: any, options: UpdateRunStepPartCacheOptions): any => {
  const { runStepPart, latestAction } = options;
  return mapOverItems<RunStepPart>(data, (items) =>
    items.map((item) => (item.id === runStepPart.id ? applyActionToRunStepPart(item, latestAction) : item))
  );
};

const applyBatchUpdate = (data: any, updatesById: Map<number, RunStepPart>): any =>
  mapOverItems<RunStepPart>(data, (items) => items.map((item) => updatesById.get(item.id) ?? item));

const normalizeLatestActions = (
  latestActions: RunStepPartState[] | ApiFormattedResponse<RunStepPartState>
): RunStepPartState[] => {
  if (Array.isArray(latestActions)) return latestActions;
  return Array.isArray(latestActions.items) ? latestActions.items : [];
};

const applyBatchActions = (
  data: any,
  latestActionsInput: RunStepPartState[] | ApiFormattedResponse<RunStepPartState>
): any => {
  const latestActions = normalizeLatestActions(latestActionsInput);
  if (latestActions.length === 0) return data;
  const actionsByStepPartId = new Map<number, RunStepPartState>(
    latestActions.map((action) => [action.updated_run_step_part_state.run_step_part_id, action])
  );
  const actionsByRunPartId = new Map<number, RunStepPartState>(
    latestActions.map((action) => [action.updated_run_step_part_state.run_part_id, action])
  );

  return mapOverItems<RunStepPart>(data, (items) =>
    items.map((item) => {
      const latestAction = actionsByStepPartId.get(item.id) ?? actionsByRunPartId.get(item.part_id);
      return latestAction ? applyActionToRunStepPart(item, latestAction) : item;
    })
  );
};

const shouldUpdateSubsequentTray = (
  item: RunStepPart,
  runStep: RunStep,
  runStepPart: RunStepPart,
  runStepsById: Map<number, RunStep>
): boolean => {
  if (item.id === runStepPart.id || item.part_id !== runStepPart.part_id) return false;

  const targetStep = runStepsById.get(item.step_id);
  if (!targetStep) return false;

  return (
    targetStep.run_id === runStep.run_id &&
    targetStep.part_level === 0 &&
    targetStep.sequence > runStep.sequence
  );
};

const upsertRunStepPartInData = (
  data: any,
  runStep: RunStep,
  runStepPart: RunStepPart,
  options: UpsertRunStepPartCacheOptions = {},
  runStepsById: Map<number, RunStep> = new Map()
): any => {
  if (!data) return data;

  const updateItem = (item: RunStepPart): RunStepPart => {
    if (item.id === runStepPart.id) return runStepPart;

    if (options.updateSubsequent && shouldUpdateSubsequentTray(item, runStep, runStepPart, runStepsById)) {
      return {
        ...item,
        tray_id: runStepPart.tray_id,
        tray_row: runStepPart.tray_row,
        tray_column: runStepPart.tray_column,
      };
    }

    return item;
  };

  if (Array.isArray(data.pages)) {
    const pages = data.pages as any[];
    const existsInAnyPage = pages.some(
      (page) => Array.isArray(page?.items) && page.items.some((item: RunStepPart) => item.id === runStepPart.id)
    );

    if (existsInAnyPage) {
      return mapOverItems<RunStepPart>(data, (items) => items.map(updateItem));
    }

    // Append to last page if not found in any page
    if (pages.length > 0) {
      const lastIndex = pages.length - 1;
      return {
        ...data,
        pages: pages.map((page: any, i: number) => {
          if (!page || !Array.isArray(page.items)) return page;
          const items = page.items.map(updateItem);
          return { ...page, items: i === lastIndex ? [...items, runStepPart] : items };
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
      items: exists ? items.map(updateItem) : [...items.map(updateItem), runStepPart],
    };
  }

  return data;
};

const getCachedRunStepsById = (queryClient: QueryClient): Map<number, RunStep> => {
  const runStepsById = new Map<number, RunStep>();

  queryClient.getQueriesData({ queryKey: ["runSteps"] }).forEach(([, data]) => {
    getItemsFromData<RunStep>(data).forEach((step) => {
      runStepsById.set(step.id, step);
    });
  });

  return runStepsById;
};

// --- Cache operations ---

const refreshRunStepPartCacheForRunStepParts = async (
  queryClient: QueryClient,
  runStepParts: RunStepPart[]
): Promise<void> => {
  if (runStepParts.length === 0) return;

  const runParts = Array.from(new Set(runStepParts.map((part) => part.part_id))).map((id) => ({ id }) as RunPart);
  if (runParts.length === 0) return;

  const result = await listRunStepParts({ runPart: runParts });
  const updatesById = new Map(result.items.map((item) => [item.id, item]));

  if (updatesById.size === 0) return;

  queryClient.setQueriesData({ queryKey: ["runStepParts"] }, (data) => applyBatchUpdate(data, updatesById));
};

const refreshRunStepCacheForRunStepParts = async (
  queryClient: QueryClient,
  runStepParts: RunStepPart[]
): Promise<void> => {
  const stepIds = Array.from(new Set(runStepParts.map((part) => part.step_id)));
  if (stepIds.length === 0) return;

  const steps = await Promise.all(stepIds.map((id) => getRunStep({ id })));
  const updatesById = new Map(steps.map((step) => [step.id, step]));

  queryClient.setQueriesData({ queryKey: ["runSteps"] }, (data) =>
    mapOverItems<RunStep>(data, (items) => items.map((item) => updatesById.get(item.id) ?? item))
  );
};

const updateRunStepPartCacheInternal = (queryClient: QueryClient, options: UpdateRunStepPartCacheOptions): void => {
  // Apply optimistic update immediately, then reconcile with fresh server data
  queryClient.setQueriesData({ queryKey: ["runStepParts"] }, (data) => applyOptimisticUpdate(data, options));

  void refreshRunStepPartCacheForRunStepParts(queryClient, [options.runStepPart]).catch((error) => {
    console.error("Failed to refresh run step part cache from run part.", error);
  });

  void refreshRunStepCacheForRunStepParts(queryClient, [options.runStepPart]).catch((error) => {
    console.error("Failed to refresh run step cache from run step part.", error);
  });
};

// --- Exports ---

export const updateRunStepPartCache = (queryClient: QueryClient, options: UpdateRunStepPartCacheOptions): void => {
  updateRunStepPartCacheInternal(queryClient, options);
};

export const updateRunStepPartCacheByRunStep = (
  queryClient: QueryClient,
  runStep: RunStep,
  options: UpdateRunStepPartCacheByRunStepOptions
): void => {
  if ("latestActions" in options) {
    queryClient.setQueriesData(
      {
        predicate: (query) =>
          Array.isArray(query.queryKey) &&
          query.queryKey[0] === "runStepParts" &&
          (query.queryKey.length === 1 || query.queryKey[1] === runStep.id),
      },
      (data) => applyBatchActions(data, options.latestActions)
    );

    const latestActions = normalizeLatestActions(options.latestActions);
    const runStepParts = latestActions.map(
      (action) =>
        ({
          id: action.updated_run_step_part_state.run_step_part_id,
          part_id: action.updated_run_step_part_state.run_part_id,
        }) as RunStepPart
    );

    void refreshRunStepPartCacheForRunStepParts(queryClient, runStepParts).catch((error) => {
      console.error("Failed to refresh run step part cache from run parts.", error);
    });

    void refreshRunStepCacheForRunStepParts(queryClient, [{ step_id: runStep.id } as RunStepPart]).catch((error) => {
      console.error("Failed to refresh run step cache from run step.", error);
    });
    return;
  }

  updateRunStepPartCacheInternal(queryClient, options);
};

export const upsertRunStepPartCache = (
  queryClient: QueryClient,
  runStep: RunStep,
  runStepPart: RunStepPart,
  options: UpsertRunStepPartCacheOptions = {}
): void => {
  const runStepsById = options.updateSubsequent ? getCachedRunStepsById(queryClient) : new Map<number, RunStep>();

  queryClient.setQueriesData({ queryKey: ["runStepParts"] }, (data) =>
    upsertRunStepPartInData(data, runStep, runStepPart, options, runStepsById)
  );
};
