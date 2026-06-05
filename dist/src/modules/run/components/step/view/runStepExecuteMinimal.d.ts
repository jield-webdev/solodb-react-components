import { Run, RunStep } from '@jield/solodb-typescript-core';
import { default as React } from 'react';
export default function RunStepExecuteMinimal({ run, runStep, showOnlyEmphasizedParameters, reloadRunStepFn, }: {
    run: Run;
    runStep: RunStep;
    showOnlyEmphasizedParameters: boolean;
    reloadRunStepFn: () => void;
}): React.JSX.Element;
