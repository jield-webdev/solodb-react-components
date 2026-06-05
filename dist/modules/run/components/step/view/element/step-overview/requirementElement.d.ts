import { default as React } from 'react';
import { Requirement, RunPart, RunStepPart } from '@jield/solodb-typescript-core';
export default function RequirementElement({ requirement, runParts, runStepParts, hideLabel, firstInGroup, }: {
    requirement: Requirement;
    runParts: RunPart[];
    runStepParts: RunStepPart[];
    hideLabel?: boolean;
    firstInGroup: boolean;
}): React.JSX.Element;
