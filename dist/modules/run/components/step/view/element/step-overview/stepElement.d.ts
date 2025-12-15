import { RunStep } from '../../../../../interfaces/runStep';
import { RunPart } from '../../../../../interfaces/run/runPart';
import { RunStepPart } from '../../../../../interfaces/step/runStepPart';
import { Requirement } from '../../../../../interfaces/requirement';
import { Run } from '../../../../../interfaces/run';
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
