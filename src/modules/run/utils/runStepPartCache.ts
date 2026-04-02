import { QueryClient } from "@tanstack/react-query";
import { RunStep, RunStepPart, RunStepPartActionEnum } from "@jield/solodb-typescript-core";

type UpdateRunStepPartCacheOptions = {
  runStepPart: RunStepPart;
  action: RunStepPartActionEnum;
  latestAction?: RunStepPart["latest_action"] | null;
};

const applyActionToRunStepPart = (
  runStepPart: RunStepPart,
  action: RunStepPartActionEnum,
  latestAction?: RunStepPart["latest_action"] | null
): RunStepPart => {
  if (latestAction?.updated_run_step_part_status) {
    const { status, processed, failed, started } = latestAction.updated_run_step_part_status;
    return {
      ...runStepPart,
      latest_action: latestAction,
      actions: runStepPart.actions + 1,
      status,
      processed,
      failed,
      started,
    };
  }

  let next: RunStepPart = {
    ...runStepPart,
    latest_action: latestAction ?? runStepPart.latest_action,
    actions: runStepPart.actions + 1,
  };

  if (action === RunStepPartActionEnum.START_PROCESSING) {
    next = { ...next, started: true, processed: false, failed: false };
  }

  if (action === RunStepPartActionEnum.FINISH_PROCESSING) {
    next = { ...next, started: true, processed: true, failed: false };
  }

  if (action === RunStepPartActionEnum.FAILED_PROCESSING) {
    next = { ...next, started: true, processed: false, failed: true };
  }

  if (action === RunStepPartActionEnum.REWORK) {
    next = { ...next, started: false, processed: false, failed: false };
  }

  return next;
};

const updateStepParts = (stepParts: RunStepPart[], options: UpdateRunStepPartCacheOptions): RunStepPart[] => {
  const { runStepPart, action, latestAction } = options;

  return stepParts.map((item) => {
    if (item.id !== runStepPart.id) {
      return item;
    }

    return applyActionToRunStepPart(item, action, latestAction);
  });
};

const updateRunStepPartsData = (data: any, options: UpdateRunStepPartCacheOptions) => {
  if (!data || !Array.isArray(data.items)) {
    return data;
  }

  return {
    ...data,
    items: updateStepParts(data.items as RunStepPart[], options),
  };
};

const upsertRunStepPartInData = (data: any, runStepPart: RunStepPart) => {
  if (!data || !Array.isArray(data.items)) {
    return data;
  }

  const items = data.items as RunStepPart[];
  const exists = items.some((item) => item.id === runStepPart.id);

  return {
    ...data,
    items: exists
      ? items.map((item) => (item.id === runStepPart.id ? runStepPart : item))
      : [...items, runStepPart],
  };
};

export const updateRunStepPartCache = (queryClient: QueryClient, options: UpdateRunStepPartCacheOptions) => {
  queryClient.setQueriesData({ queryKey: ["runStepParts"] }, (data) => updateRunStepPartsData(data, options));
  queryClient.setQueriesData({ queryKey: ["stepParts"] }, (data) => updateRunStepPartsData(data, options));
};

export const updateRunStepPartCacheByRunStep = (
  queryClient: QueryClient,
  runStep: RunStep,
  options: UpdateRunStepPartCacheOptions
) => {
  queryClient.setQueriesData({ queryKey: ["runStepParts", runStep.id] }, (data) =>
    updateRunStepPartsData(data, options)
  );
  queryClient.setQueriesData({ queryKey: ["stepParts", runStep.id] }, (data) => updateRunStepPartsData(data, options));
};

export const upsertRunStepPartCache = (queryClient: QueryClient, runStep: RunStep, runStepPart: RunStepPart) => {
  queryClient.setQueriesData({ queryKey: ["runStepParts", runStep.id] }, (data) =>
    upsertRunStepPartInData(data, runStepPart)
  );
};
