import { Run, RunStep, RunPart, RunStepPart, Requirement } from '@jield/solodb-typescript-core';
export default function StepInList({ run, step, parts, stepParts, monitoredBy, refetchFn, }: {
    run: Run;
    step: RunStep;
    parts: RunPart[];
    stepParts: RunStepPart[];
    monitoredBy: Requirement | undefined;
    refetchFn: (key: any[]) => void;
}): import("react/jsx-runtime").JSX.Element;
