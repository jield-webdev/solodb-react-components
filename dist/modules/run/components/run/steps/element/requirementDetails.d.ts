import { RunStepPart } from '../../../../interfaces/step/runStepPart';
import { RunStep } from '../../../../interfaces/runStep';
import { RunPart } from '../../../../interfaces/run/runPart';
import { Requirement } from '../../../../interfaces/requirement';
import { MeasurementResult } from '../../../../interfaces/measurement/result';
export default function RequirementDetails({ requirement, step, stepParts, parts, measurementResults, refetchFn, }: {
    requirement: Requirement;
    step: RunStep;
    stepParts: RunStepPart[];
    parts: RunPart[];
    measurementResults: MeasurementResult[];
    refetchFn: (keys: string[]) => void;
}): import("react/jsx-runtime").JSX.Element;
