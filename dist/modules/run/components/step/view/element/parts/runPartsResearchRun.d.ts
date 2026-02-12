import { Run, RunStep, RunStepPart } from '@jield/solodb-typescript-core';
type Props = {
    run: Run;
    runStep: RunStep;
    runStepParts?: RunStepPart[];
    editable?: boolean;
    refetchFn?: () => void;
    toggleRunStepPartRef?: React.RefObject<{
        setPart: (part: number) => void;
    } | null>;
};
declare const RunPartsResearchRun: ({ run: _run, runStep, runStepParts, editable, refetchFn, toggleRunStepPartRef, }: Props) => import("react/jsx-runtime").JSX.Element | null;
export default RunPartsResearchRun;
