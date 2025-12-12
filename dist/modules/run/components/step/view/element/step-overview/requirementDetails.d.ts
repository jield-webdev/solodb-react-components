import { RunStep } from '../../../../../interfaces/runStep';
import { MeasurementResult } from '../../../../../interfaces/measurement/result';
import { RunPart } from '../../../../../interfaces/run/runPart';
import { RunStepPart } from '../../../../../interfaces/step/runStepPart';
import { Requirement } from '../../../../../interfaces/requirement';
export default function RequirementDetails({ requirement, step, stepParts, parts, measurementResults, }: {
    requirement: Requirement;
    step: RunStep;
    stepParts: RunStepPart[];
    parts: RunPart[];
    measurementResults: MeasurementResult[];
}): import("react/jsx-runtime").JSX.Element;
