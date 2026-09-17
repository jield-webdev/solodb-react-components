import React, { Suspense, useMemo } from "react";
import { Alert, Button } from "react-bootstrap";
import { useRun } from "@jield/solodb-react-components/modules/run/hooks/useRun";
import { RunContext } from "@jield/solodb-react-components/modules/run/contexts/runContext";
import LoadingComponent from "@jield/solodb-react-components/modules/core/components/common/LoadingComponent";
import ErrorBoundary from "@jield/solodb-react-components/modules/core/components/common/ErrorBoundary";

export default function RunProvider({ children }: { children: React.ReactNode }) {
  const { run, isError, canRetry, error, reloadRun } = useRun();

  // Consumers re-render on every context value identity change, so keep it stable across the
  // refetches useRun now performs.
  const contextValue = useMemo(() => ({ run: run!, reloadRun }), [run, reloadRun]);

  if (isError) {
    return (
      <Alert variant="danger" className="m-3">
        <Alert.Heading>Could not load run</Alert.Heading>
        <p className={canRetry ? "mb-3" : "mb-0"}>
          {error instanceof Error ? error.message : "The run could not be loaded."}
        </p>
        {canRetry && (
          <Button variant="outline-danger" onClick={reloadRun}>
            Retry
          </Button>
        )}
      </Alert>
    );
  }

  if (null === run) {
    return <LoadingComponent message="Loading run..." />;
  }

  return (
    <ErrorBoundary>
      <RunContext.Provider value={contextValue}>
        <Suspense fallback={<LoadingComponent message="Loading rest of run..." />}>{children}</Suspense>
      </RunContext.Provider>
    </ErrorBoundary>
  );
}
