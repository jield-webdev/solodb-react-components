import { RunStepPart } from '../../../../../../interfaces/step/runStepPart';
import { RunPart } from '../../../../../../interfaces/run/runPart';
import { RunStep } from '../../../../../../interfaces/runStep';
declare const RunStepPartProductionTableRow: ({ runPart, runStepParts, runStep, refetchFn, }: {
    runPart: RunPart;
    runStepParts: RunStepPart[];
    runStep: RunStep;
    refetchFn?: () => void;
}) => import("react/jsx-runtime").JSX.Element;
export default RunStepPartProductionTableRow;
