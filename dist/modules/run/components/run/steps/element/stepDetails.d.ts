import { RunStep, RunStepPart, RunPart, Run } from '@jield/solodb-typescript-core';
export default function StepDetails({ run, step, stepParts, parts, refetchFn, }: {
    run?: Run;
    step: RunStep;
    stepParts: RunStepPart[];
    parts: RunPart[];
    refetchFn?: (keys: any[]) => void;
}): import("react/jsx-runtime").JSX.Element;
