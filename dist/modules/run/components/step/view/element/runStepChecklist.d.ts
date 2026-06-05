import { default as React } from 'react';
import { Run, RunStep } from '@jield/solodb-typescript-core';
export default function RunStepChecklist({ run, runStep, reloadRunStep, }: {
    run?: Run;
    runStep?: RunStep;
    reloadRunStep?: () => void;
}): React.JSX.Element;
