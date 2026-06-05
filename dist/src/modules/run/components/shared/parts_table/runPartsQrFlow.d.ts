import { default as React } from 'react';
import { Run, RunStep, RunPart, RunStepPart } from '@jield/solodb-typescript-core';
type Props = {
    run: Run;
    runStep: RunStep;
};
declare const RunPartsQrFlow: ({ run, runStep }: Props) => React.JSX.Element;
export declare const isRunPartFinish: (runStepParts: RunStepPart[], part: RunPart) => boolean;
export default RunPartsQrFlow;
