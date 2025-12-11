import React, { createContext } from "react";

interface EmphasizedParametersContext {
  showOnlyEmphasizedParameters: boolean;
  setShowOnlyEmphasizedParameters: React.Dispatch<React.SetStateAction<boolean>>;
}

export const EmphasizedParametersContext = createContext<EmphasizedParametersContext>({
  showOnlyEmphasizedParameters: false,
  setShowOnlyEmphasizedParameters: () => {},
});
