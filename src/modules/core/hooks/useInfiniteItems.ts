import { useEffect, useMemo } from "react";
import { QueryKey, useInfiniteQuery } from "@tanstack/react-query";
import { useInView } from "react-intersection-observer";
import { ApiFormattedResponse } from "@jield/solodb-typescript-core";

export function useInfiniteItems<T>({
  queryKey,
  queryFn,
  enabled = true,
}: {
  queryKey: QueryKey;
  queryFn: (page: number) => Promise<ApiFormattedResponse<T>>;
  enabled?: boolean;
}) {
  const { ref: sentinelRef, inView } = useInView();

  const { data, isFetching, isFetchingNextPage, fetchNextPage, hasNextPage, isError } = useInfiniteQuery({
    queryKey,
    queryFn: ({ pageParam }) => queryFn(pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.currentPage + 1 : undefined),
    enabled,
  });

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const items = useMemo(() => data?.pages.flatMap((page) => page.items) ?? [], [data]);

  return { items, sentinelRef, isFetching, isError };
}
