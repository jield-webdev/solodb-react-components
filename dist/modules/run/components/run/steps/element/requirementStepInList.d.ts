import { RunPart } from '../../../../interfaces/run/runPart';
import { RunStepPart } from '../../../../interfaces/step/runStepPart';
import { Requirement } from '../../../../interfaces/requirement';
import { RunStep } from '../../../../interfaces/runStep';
export default function RequirementStepInList({ requirement, step, parts, stepParts, refetchFn, }: {
    requirement: Requirement;
    step: RunStep;
    parts: RunPart[];
    stepParts: RunStepPart[];
    refetchFn: (key: any[]) => void;
}): import("react/jsx-runtime").JSX.Element;
