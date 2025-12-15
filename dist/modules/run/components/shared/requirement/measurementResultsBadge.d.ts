import { MeasurementResult } from '../../../interfaces/measurement/result';
import { Requirement } from '../../../interfaces/requirement';
import { RunPart } from '../../../interfaces/run/runPart';
import { RunStep } from '../../../interfaces/runStep';
import { RunStepPart } from '../../../interfaces/step/runStepPart';
export declare const MeasurementResultsBadges: ({ requirement, step, measurementResults, parts, stepParts, }: {
    requirement: Requirement;
    step: RunStep;
    measurementResults: MeasurementResult[];
    parts: RunPart[];
    stepParts: RunStepPart[];
}) => import("react/jsx-runtime").JSX.Element;
