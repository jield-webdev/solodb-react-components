import { Run, RunStep, RunStepPart } from '@jield/solodb-typescript-core';
declare const RunPartsResearchRun: ({ run, runStep, runStepParts, editable, refetchFn, }: {
    run: Run;
    runStep: RunStep;
    runStepParts?: RunStepPart[];
    editable?: boolean;
    refetchFn?: () => void;
}) => import("react/jsx-runtime").JSX.Element | null;
export default RunPartsResearchRun;
