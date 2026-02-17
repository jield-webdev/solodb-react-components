import { default as React } from 'react';
import { Run, RunStep, RunStepPart, RunPart } from '@jield/solodb-typescript-core';
type Props = {
    run: Run;
    runStep: RunStep;
    runStepParts?: RunStepPart[];
    runParts?: RunPart[];
    refetchFn?: () => void;
    toggleRunPartRef?: React.RefObject<{
        setPart: (part: number) => void;
    } | null>;
};
declare const RunPartsProductionRun: ({ run, runStep, runStepParts, runParts, refetchFn, toggleRunPartRef, }: Props) => import("react/jsx-runtime").JSX.Element;
export default RunPartsProductionRun;
