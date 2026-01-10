import React, { useState } from "react";
import { EmphasizedParametersContext } from "@jield/solodb-react-components/modules/run/contexts/emphasizedParametersContext";

export default function EmphasizedParametersProvider({ children }: { children: React.ReactNode }) {
  const [showOnlyEmphasizedParameters, setShowOnlyEmphasizedParameters] = useState<boolean>(false);
  return (
    <EmphasizedParametersContext.Provider
      value={{
        showOnlyEmphasizedParameters: showOnlyEmphasizedParameters,
        setShowOnlyEmphasizedParameters: setShowOnlyEmphasizedParameters,
      }}
    >
      {children}
    </EmphasizedParametersContext.Provider>
  );
}
