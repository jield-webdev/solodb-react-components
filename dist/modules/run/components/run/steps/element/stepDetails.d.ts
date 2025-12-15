import { RunStepPart } from '../../../../interfaces/step/runStepPart';
import { RunStep } from '../../../../interfaces/runStep';
import { RunPart } from '../../../../interfaces/run/runPart';
export default function StepDetails({ step, stepParts, parts, refetchFn, }: {
    step: RunStep;
    stepParts: RunStepPart[];
    parts: RunPart[];
    refetchFn: (keys: any[]) => void;
}): import("react/jsx-runtime").JSX.Element;
