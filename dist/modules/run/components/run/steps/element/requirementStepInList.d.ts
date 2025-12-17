import { Requirement, RunStep, RunPart, RunStepPart } from 'solodb-typescript-core';
export default function RequirementStepInList({ requirement, step, parts, stepParts, refetchFn, }: {
    requirement: Requirement;
    step: RunStep;
    parts: RunPart[];
    stepParts: RunStepPart[];
    refetchFn: (key: any[]) => void;
}): import("react/jsx-runtime").JSX.Element;
