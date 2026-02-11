import { Run, RunStep, RunStepPart } from '@jield/solodb-typescript-core';
type RunPartsResearchRunProps = {
    run: Run;
    runStep: RunStep;
    runStepParts?: RunStepPart[];
    editable?: boolean;
    refetchFn?: () => void;
};
declare const RunPartsResearchRun: ({ run: _run, runStep, runStepParts, editable, refetchFn, }: RunPartsResearchRunProps) => import("react/jsx-runtime").JSX.Element | null;
export default RunPartsResearchRun;
