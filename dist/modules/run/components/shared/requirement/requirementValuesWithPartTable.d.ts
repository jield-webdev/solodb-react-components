import { MeasurementResult } from '../../../interfaces/measurement/result';
import { Requirement } from '../../../interfaces/requirement';
import { RunPart } from '../../../interfaces/run/runPart';
import { RunStep } from '../../../interfaces/runStep';
import { RunStepPart } from '../../../interfaces/step/runStepPart';
export default function RequirementValuesWithPartTable({ requirement, step, stepParts, parts, measurementResults, refetchFn, editOnly, }: {
    requirement: Requirement;
    step: RunStep;
    stepParts?: RunStepPart[];
    parts?: RunPart[];
    measurementResults?: MeasurementResult[];
    refetchFn?: (keys: any[]) => void;
    editOnly?: boolean;
}): import("react/jsx-runtime").JSX.Element;
