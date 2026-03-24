import { Run, RunStep, RunStepPart, RunPart } from '@jield/solodb-typescript-core';
type Props = {
    run: Run;
    runStep: RunStep;
    runStepParts?: RunStepPart[];
    runParts?: RunPart[];
    refetchFn?: () => void;
};
declare const RunPartsProductionRun: ({ run, runStep, runStepParts, runParts, refetchFn, }: Props) => import("react/jsx-runtime").JSX.Element;
export default RunPartsProductionRun;
