import { Run, RunStep } from '@jield/solodb-typescript-core';
export default function RunStepChecklist({ run, runStep, reloadRunStep, }: {
    run?: Run;
    runStep?: RunStep;
    reloadRunStep?: () => void;
}): import("react/jsx-runtime").JSX.Element;
