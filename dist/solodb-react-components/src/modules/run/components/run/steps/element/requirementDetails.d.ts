import { Requirement, RunStep, RunStepPart, RunPart, MeasurementResult } from '../../../../../../../../solodb-typescript-core/src/index.ts';
export default function RequirementDetails({ requirement, step, stepParts, parts, measurementResults, refetchFn, }: {
    requirement: Requirement;
    step: RunStep;
    stepParts: RunStepPart[];
    parts: RunPart[];
    measurementResults: MeasurementResult[];
    refetchFn: (keys: string[]) => void;
}): import("react/jsx-runtime").JSX.Element;
