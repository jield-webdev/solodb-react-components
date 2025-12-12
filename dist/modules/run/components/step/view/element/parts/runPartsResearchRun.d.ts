import { RunStepPart } from '../../../../../interfaces/step/runStepPart';
import { RunStep } from '../../../../../interfaces/runStep';
import { Run } from '../../../../../interfaces/run';
declare const RunPartsResearchRun: ({ run, runStep, runStepParts, editable, refetchFn, }: {
    run: Run;
    runStep: RunStep;
    runStepParts?: RunStepPart[];
    editable?: boolean;
    refetchFn?: () => void;
}) => import("react/jsx-runtime").JSX.Element | null;
export default RunPartsResearchRun;
