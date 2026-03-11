import { QueryClient } from "@tanstack/react-query";
import { RunStepPart, RunStepPartActionEnum } from "@jield/solodb-typescript-core";

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

const updateStepParts = (
  stepParts: RunStepPart[],
  options: UpdateRunStepPartCacheOptions
): RunStepPart[] => {
  const { runStepPart, action, latestAction } = options;

  return stepParts.map((item) => {
    const shouldMarkFailedPart =
      action === RunStepPartActionEnum.FAILED_PROCESSING && item.part.id === runStepPart.part.id;
    const shouldUpdateItem = item.id === runStepPart.id;

    if (!shouldMarkFailedPart && !shouldUpdateItem) {
      return item;
    }

    let next = item;

    if (shouldMarkFailedPart) {
      next = {
        ...next,
        part: {
          ...next.part,
          part_processing_failed: true,
        },
      };
    }

    if (shouldUpdateItem) {
      next = applyActionToRunStepPart(next, action, latestAction);
    }

    return next;
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

export const updateRunStepPartCache = (queryClient: QueryClient, options: UpdateRunStepPartCacheOptions) => {
  queryClient.setQueriesData({ queryKey: ["runStepParts"] }, (data) => updateRunStepPartsData(data, options));
  queryClient.setQueriesData({ queryKey: ["stepParts"] }, (data) => updateRunStepPartsData(data, options));
};
