import { Run, RunStep } from '@jield/solodb-typescript-core';
import { default as React } from 'react';
export default function RunStepExecuteMinimal({ run, runStep, showOnlyEmphasizedParameters, reloadRunStepFn, toggleRunPartRef, }: {
    run: Run;
    runStep: RunStep;
    showOnlyEmphasizedParameters: boolean;
    reloadRunStepFn: () => void;
    toggleRunPartRef?: React.RefObject<{
        setPart: (part: number) => void;
        setPartByLabel: (label: string) => void;
    } | null>;
}): import("react/jsx-runtime").JSX.Element;
