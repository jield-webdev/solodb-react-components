import React, { Suspense, useState } from "react";
import { EmphasizedParametersContext } from "@jield/solodb-react-components/modules/run/contexts/emphasizedParametersContext";
import LoadingComponent from "@jield/solodb-react-components/modules/core/components/common/LoadingComponent";
import ErrorBoundary from "@jield/solodb-react-components/modules/core/components/common/ErrorBoundary";

export default function EmphasizedParametersProvider({ children }: { children: React.ReactNode }) {
  const [showOnlyEmphasizedParameters, setShowOnlyEmphasizedParameters] = useState<boolean>(false);
  return (
    <ErrorBoundary>
      <EmphasizedParametersContext.Provider
        value={{
          showOnlyEmphasizedParameters: showOnlyEmphasizedParameters,
          setShowOnlyEmphasizedParameters: setShowOnlyEmphasizedParameters,
        }}
      >
        <Suspense fallback={<LoadingComponent message="Loading..." />}>{children}</Suspense>
      </EmphasizedParametersContext.Provider>
    </ErrorBoundary>
  );
}
