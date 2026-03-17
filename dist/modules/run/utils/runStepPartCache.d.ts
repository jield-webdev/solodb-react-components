import { QueryClient } from '@tanstack/react-query';
import { RunStepPart, RunStepPartActionEnum } from '@jield/solodb-typescript-core';
type UpdateRunStepPartCacheOptions = {
    runStepPart: RunStepPart;
    action: RunStepPartActionEnum;
    latestAction?: RunStepPart["latest_action"] | null;
};
export declare const updateRunStepPartCache: (queryClient: QueryClient, options: UpdateRunStepPartCacheOptions) => void;
export {};
