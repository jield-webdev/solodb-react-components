import React, { Suspense } from "react";
import { useRun } from "@jield/solodb-react-components/modules/run/hooks/useRun";
import { RunContext } from "@jield/solodb-react-components/modules/run/contexts/runContext";
import LoadingComponent from "@jield/solodb-react-components/modules/core/components/common/LoadingComponent";
import ErrorBoundary from "@jield/solodb-react-components/modules/core/components/common/ErrorBoundary";

export default function RunProvider({ children }: { children: React.ReactNode }) {
  const { run, reloadRun } = useRun();

  if (null === run) {
    return <LoadingComponent message="Loading run..." />;
  }

  return (
    <ErrorBoundary>
      <RunContext.Provider
        value={{
          run,
          reloadRun,
        }}
      >
        <Suspense fallback={<LoadingComponent message="Loading rest of run..." />}>{children}</Suspense>
      </RunContext.Provider>
    </ErrorBoundary>
  );
}
