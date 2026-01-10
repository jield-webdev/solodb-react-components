import { Run, RunStep, RunStepPart, RunStepPartActionEnum } from '../../../../../../../../../solodb-typescript-core/src/index.ts';
declare const RunPartsResearchRun: ({ run, runStep, runStepParts, editable, refetchFn, }: {
    run: Run;
    runStep: RunStep;
    runStepParts?: RunStepPart[];
    editable?: boolean;
    refetchFn?: () => void;
}) => import("react/jsx-runtime").JSX.Element | null;
export declare const getAvailableRunStepPartActions: (runStepPart: RunStepPart) => RunStepPartActionEnum[];
export default RunPartsResearchRun;
