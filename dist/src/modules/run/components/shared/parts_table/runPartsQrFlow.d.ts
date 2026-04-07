import { Run, RunStep, RunPart, RunStepPart } from '@jield/solodb-typescript-core';
type Props = {
    run: Run;
    runStep: RunStep;
};
declare const RunPartsQrFlow: ({ run, runStep }: Props) => import("react/jsx-runtime").JSX.Element;
export declare const isRunPartFinish: (runStepParts: RunStepPart[], part: RunPart) => boolean;
export default RunPartsQrFlow;
