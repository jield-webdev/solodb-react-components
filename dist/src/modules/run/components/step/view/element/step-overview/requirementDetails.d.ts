import { Requirement, RunStep, RunStepPart, RunPart, MeasurementResult } from '@jield/solodb-typescript-core';
export default function RequirementDetails({ requirement, step, stepParts, parts, measurementResults, }: {
    requirement: Requirement;
    step: RunStep;
    stepParts: RunStepPart[];
    parts: RunPart[];
    measurementResults: MeasurementResult[];
}): import("react/jsx-runtime").JSX.Element;
