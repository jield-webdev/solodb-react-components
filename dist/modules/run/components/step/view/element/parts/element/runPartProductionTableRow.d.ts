import { RunPart, RunStepPart, RunStep } from '@jield/solodb-typescript-core';
declare const RunStepPartProductionTableRow: ({ runPart, runStepParts, runStep, refetchFn, partIsSelected, setPartAsSelected, }: {
    runPart: RunPart;
    runStepParts: RunStepPart[];
    runStep: RunStep;
    refetchFn?: () => void;
    partIsSelected?: boolean;
    setPartAsSelected?: (partID: number) => void;
}) => import("react/jsx-runtime").JSX.Element;
export default RunStepPartProductionTableRow;
