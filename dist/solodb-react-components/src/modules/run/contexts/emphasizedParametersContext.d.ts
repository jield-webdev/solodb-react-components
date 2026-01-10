import { default as React } from 'react';
interface EmphasizedParametersContext {
    showOnlyEmphasizedParameters: boolean;
    setShowOnlyEmphasizedParameters: React.Dispatch<React.SetStateAction<boolean>>;
}
export declare const EmphasizedParametersContext: React.Context<EmphasizedParametersContext>;
export {};
