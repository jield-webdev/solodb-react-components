import { Run, RunStep } from '@jield/solodb-typescript-core';
import { default as React } from 'react';
export default function RunStepExecuteMinimal({ run, runStep, showOnlyEmphasizedParameters, reloadRunStepFn, toggleRunStepPartRef, toggleRunPartRef, }: {
    run: Run;
    runStep: RunStep;
    showOnlyEmphasizedParameters: boolean;
    reloadRunStepFn: () => void;
    toggleRunStepPartRef?: React.RefObject<{
        setPart: (part: number) => void;
    } | null>;
    toggleRunPartRef?: React.RefObject<{
        setPart: (part: number) => void;
    } | null>;
}): import("react/jsx-runtime").JSX.Element;
