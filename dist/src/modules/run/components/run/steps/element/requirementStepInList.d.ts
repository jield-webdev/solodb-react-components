import { Requirement, RunStep, RunPart } from '@jield/solodb-typescript-core';
export default function RequirementStepInList({ requirement, step, parts, refetchFn, }: {
    requirement: Requirement;
    step: RunStep;
    parts: RunPart[];
    refetchFn: (key: any[]) => void;
}): import("react/jsx-runtime").JSX.Element;
