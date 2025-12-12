import { RunPart } from '../../../interfaces/run/runPart';
import { RunStep } from '../../../interfaces/runStep';
import { RunStepPart } from '../../../interfaces/step/runStepPart';
export declare const PartBadgesProductionRun: ({ runStep, parts, runStepParts, reloadFn, }: {
    runStep: RunStep;
    parts: RunPart[];
    runStepParts: RunStepPart[];
    reloadFn?: () => void;
}) => import("react/jsx-runtime").JSX.Element;
