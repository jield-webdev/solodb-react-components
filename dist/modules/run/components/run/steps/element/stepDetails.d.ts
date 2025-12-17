import { RunStep, RunStepPart, RunPart } from 'solodb-typescript-core';
export default function StepDetails({ step, stepParts, parts, refetchFn, }: {
    step: RunStep;
    stepParts: RunStepPart[];
    parts: RunPart[];
    refetchFn: (keys: any[]) => void;
}): import("react/jsx-runtime").JSX.Element;
