import { RunStepPart } from '../../../../../../interfaces/step/runStepPart';
import { RunPart } from '../../../../../../interfaces/run/runPart';
import { RunStep } from '../../../../../../interfaces/runStep';
declare const RunStepPartProductionBadge: ({ runPart, runStepParts, runStep, reloadFn, }: {
    runPart: RunPart;
    runStepParts: RunStepPart[];
    runStep: RunStep;
    reloadFn?: () => void;
}) => import("react/jsx-runtime").JSX.Element;
export default RunStepPartProductionBadge;
