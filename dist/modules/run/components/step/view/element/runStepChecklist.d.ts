import { Run, RunStep } from '@jield/solodb-typescript-core';
export default function RunStepChecklist({ run, runStep, reloadRunStep, movePage, }: {
    run?: Run;
    runStep?: RunStep;
    reloadRunStep?: () => void;
    movePage?: boolean;
}): import("react/jsx-runtime").JSX.Element;
