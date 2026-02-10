import React, { Suspense } from "react";
import { useMonitor } from "@jield/solodb-react-components/modules/monitor/hooks/useMonitor";
import { MonitorContext } from "@jield/solodb-react-components/modules/monitor/contexts/monitorContext";
import LoadingComponent from "@jield/solodb-react-components/modules/core/components/common/LoadingComponent";
import ErrorBoundary from "@jield/solodb-react-components/modules/core/components/common/ErrorBoundary";

export default function MonitorProvider({ children }: { children: React.ReactNode }) {
  const { monitor, reloadMonitor } = useMonitor();

  if (null === monitor) {
    return (
      <ErrorBoundary>
        <LoadingComponent message="Loading monitor..." />
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <MonitorContext.Provider
        value={{
          monitor,
          reloadMonitor,
        }}
      >
        <Suspense fallback={<LoadingComponent message="Loading..." />}>{children}</Suspense>
      </MonitorContext.Provider>
    </ErrorBoundary>
  );
}
