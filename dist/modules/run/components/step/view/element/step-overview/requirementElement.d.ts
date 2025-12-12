import { RunPart } from '../../../../../interfaces/run/runPart';
import { RunStepPart } from '../../../../../interfaces/step/runStepPart';
import { Requirement } from '../../../../../interfaces/requirement';
export default function RequirementElement({ requirement, runParts, runStepParts, hideLabel, firstInGroup, }: {
    requirement: Requirement;
    runParts: RunPart[];
    runStepParts: RunStepPart[];
    hideLabel?: boolean;
    firstInGroup: boolean;
}): import("react/jsx-runtime").JSX.Element;
