import { default as React } from 'react';
import { Requirement, Run, RunPart, RunStep, RunStepPart } from '@jield/solodb-typescript-core';
declare const StepElement: ({ run, monitoredBy, runStep, runParts, runStepParts, hideLabel, firstInGroup, }: {
    run: Run;
    monitoredBy: Requirement | undefined;
    runStep: RunStep;
    runParts: RunPart[];
    runStepParts: RunStepPart[];
    hideLabel?: boolean;
    firstInGroup: boolean;
}) => React.JSX.Element;
export default StepElement;
