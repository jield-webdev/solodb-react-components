import { RunPart, RunStepPart, RunStep } from 'solodb-typescript-core';
declare const RunStepPartProductionTableRow: ({ runPart, runStepParts, runStep, refetchFn, }: {
    runPart: RunPart;
    runStepParts: RunStepPart[];
    runStep: RunStep;
    refetchFn?: () => void;
}) => import("react/jsx-runtime").JSX.Element;
export default RunStepPartProductionTableRow;
