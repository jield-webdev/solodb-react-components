import { Run, RunStep, RunStepPart, RunPart } from '@jield/solodb-typescript-core';
declare const RunPartsProductionRun: ({ run, runStep, runStepParts, runParts, refetchFn, }: {
    run: Run;
    runStep: RunStep;
    runStepParts?: RunStepPart[];
    runParts?: RunPart[];
    refetchFn?: () => void;
}) => import("react/jsx-runtime").JSX.Element;
export default RunPartsProductionRun;
