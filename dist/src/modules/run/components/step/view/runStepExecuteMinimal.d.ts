import { Run, RunStep } from '@jield/solodb-typescript-core';
export default function RunStepExecuteMinimal({ run, runStep, showOnlyEmphasizedParameters, reloadRunStepFn, }: {
    run: Run;
    runStep: RunStep;
    showOnlyEmphasizedParameters: boolean;
    reloadRunStepFn: () => void;
}): import("react/jsx-runtime").JSX.Element;
