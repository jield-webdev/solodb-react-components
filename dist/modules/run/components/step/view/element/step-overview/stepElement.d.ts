import { Requirement, Run, RunPart, RunStep, RunStepPart } from 'solodb-typescript-core';
declare const StepElement: ({ run, monitoredBy, runStep, runParts, runStepParts, hideLabel, firstInGroup, }: {
    run: Run;
    monitoredBy: Requirement | undefined;
    runStep: RunStep;
    runParts: RunPart[];
    runStepParts: RunStepPart[];
    hideLabel?: boolean;
    firstInGroup: boolean;
}) => import("react/jsx-runtime").JSX.Element;
export default StepElement;
