import { QueryKey } from '@tanstack/react-query';
import { ApiFormattedResponse } from '@jield/solodb-typescript-core';
export declare function useInfiniteItems<T>({ queryKey, queryFn, enabled, }: {
    queryKey: QueryKey;
    queryFn: (page: number) => Promise<ApiFormattedResponse<T>>;
    enabled?: boolean;
}): {
    items: T[];
    sentinelRef: (node?: Element | null) => void;
    isFetching: boolean;
    isError: boolean;
};
