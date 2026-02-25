import { RunPart, RunStepPart, RunStep } from '@jield/solodb-typescript-core';
declare const RunStepPartProductionTableRow: ({ runPart, runStepParts, runStep, refetchFn, partIsSelected, setPartAsSelected, dropdown, }: {
    runPart: RunPart;
    runStepParts: RunStepPart[];
    runStep: RunStep;
    refetchFn?: () => void;
    partIsSelected?: boolean;
    setPartAsSelected?: (partID: number) => void;
    dropdown?: boolean;
}) => import("react/jsx-runtime").JSX.Element;
export default RunStepPartProductionTableRow;
