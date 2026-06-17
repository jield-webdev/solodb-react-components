import { default as React } from 'react';
import { RunStep } from '@jield/solodb-typescript-core';
export declare const RunStepParametersTable: ({ runStep, showOnlyEmphasizedParameters, editableParameters, refetchFn, }: {
    runStep: RunStep;
    showOnlyEmphasizedParameters: boolean;
    editableParameters?: boolean;
    refetchFn?: () => void;
}) => React.JSX.Element;
