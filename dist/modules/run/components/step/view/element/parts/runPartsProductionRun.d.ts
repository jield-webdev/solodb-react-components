import { RunPart } from '../../../../../interfaces/run/runPart';
import { RunStep } from '../../../../../interfaces/runStep';
import { Run } from '../../../../../interfaces/run';
import { RunStepPart } from '../../../../../interfaces/step/runStepPart';
declare const RunPartsProductionRun: ({ run, runStep, runStepParts, runParts, refetchFn, }: {
    run: Run;
    runStep: RunStep;
    runStepParts?: RunStepPart[];
    runParts?: RunPart[];
    refetchFn?: () => void;
}) => import("react/jsx-runtime").JSX.Element;
export default RunPartsProductionRun;
