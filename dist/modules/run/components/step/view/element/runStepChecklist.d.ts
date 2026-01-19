import { Run, RunStep } from '@jield/solodb-typescript-core';
export default function RunStepChecklist({ run, runStep, reloadRunStep, nextStepBtn, }: {
    run?: Run;
    runStep?: RunStep;
    reloadRunStep?: () => void;
    nextStepBtn?: boolean;
}): import("react/jsx-runtime").JSX.Element;
