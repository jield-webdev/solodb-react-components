import { Requirement, RunPart, RunStepPart } from '../../../../../../../../../solodb-typescript-core/src/index.ts';
export default function RequirementElement({ requirement, runParts, runStepParts, hideLabel, firstInGroup, }: {
    requirement: Requirement;
    runParts: RunPart[];
    runStepParts: RunStepPart[];
    hideLabel?: boolean;
    firstInGroup: boolean;
}): import("react/jsx-runtime").JSX.Element;
