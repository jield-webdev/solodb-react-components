import { default as React } from 'react';
import { Run, RunStep } from '@jield/solodb-typescript-core';
declare const StepDetails: ({ run, runStep, showOnlyEmphasizedParameters, }: {
    run: Run;
    runStep: RunStep;
    showOnlyEmphasizedParameters: boolean;
}) => React.JSX.Element;
export default StepDetails;
