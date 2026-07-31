import { useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { getRun } from "@jield/solodb-typescript-core";
import { getRunQueryKey } from "@jield/solodb-react-components/modules/run/utils/runCache";

export const useRun = () => {
  const { id } = useParams();
  const runId = parseInt(id!);
  const hasRunId = Number.isInteger(runId);

  const {
    data: run = null,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: getRunQueryKey(runId),
    queryFn: () => getRun({ id: runId }),
    // Without an :id in the route parseInt yields NaN; never send that to the API.
    enabled: hasRunId,
  });

  const reloadRun = useCallback(() => {
    void refetch();
  }, [refetch]);

  return {
    run,
    isError: isError || !hasRunId,
    // A missing route id is not something a refetch can recover from; the query stays disabled.
    canRetry: hasRunId,
    error: hasRunId ? error : new Error("No run id in the route."),
    reloadRun,
  };
};
