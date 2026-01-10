import { MeasurementResult, Requirement, RunPart, RunStep, RunStepPart } from '@jield/solodb-typescript-core';
export default function RequirementValuesWithPartTable({ requirement, step, stepParts, parts, measurementResults, refetchFn, editOnly, }: {
    requirement: Requirement;
    step: RunStep;
    stepParts?: RunStepPart[];
    parts?: RunPart[];
    measurementResults?: MeasurementResult[];
    refetchFn?: (keys: any[]) => void;
    editOnly?: boolean;
}): import("react/jsx-runtime").JSX.Element;
