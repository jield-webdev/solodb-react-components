import React, { Suspense, useState } from "react";
import { useRunStep } from "@jield/solodb-react-components/modules/run/hooks/useRunStep";
import { ModalProperties } from "@jield/solodb-react-components/modules/core/interfaces/modalProperties";
import { RunStepContext } from "@jield/solodb-react-components/modules/run/contexts/runStepContext";
import LoadingComponent from "@jield/solodb-react-components/modules/core/components/common/LoadingComponent";
import ErrorBoundary from "@jield/solodb-react-components/modules/core/components/common/ErrorBoundary";

export default function RunStepProvider({ children }: { children: React.ReactNode }) {
  const { runStep, setRunStep, run, reloadRunStep } = useRunStep();
  const [modalProperties, setModalProperties] = useState({} as ModalProperties);

  if (null === runStep || null === run) {
    let loadingMessage = "Loading run...";

    if (null === runStep && null === run) {
      loadingMessage = "Loading run and run step...";
    } else if (null === run) {
      loadingMessage = "Loading run step...";
    }

    return (
      <ErrorBoundary>
        <LoadingComponent message={loadingMessage} />
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <RunStepContext.Provider
        value={{
          runStep,
          setRunStep,
          reloadRunStep,
          run,
          modalProperties,
          setModalProperties,
        }}
      >
        <Suspense fallback={<LoadingComponent message="Loading..." />}>{children}</Suspense>
      </RunStepContext.Provider>
    </ErrorBoundary>
  );
}
