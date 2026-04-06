import { QueryClient } from '@tanstack/react-query';
import { RunStep, RunStepPart, RunStepPartActionEnum } from '@jield/solodb-typescript-core';
type UpdateRunStepPartCacheOptions = {
    runStepPart: RunStepPart;
    action: RunStepPartActionEnum;
    latestAction?: RunStepPart["latest_action"] | null;
};
export declare const updateRunStepPartCache: (queryClient: QueryClient, options: UpdateRunStepPartCacheOptions) => void;
export declare const updateRunStepPartCacheByRunStep: (queryClient: QueryClient, runStep: RunStep, options: UpdateRunStepPartCacheOptions) => void;
export declare const upsertRunStepPartCache: (queryClient: QueryClient, runStep: RunStep, runStepPart: RunStepPart) => void;
export {};
