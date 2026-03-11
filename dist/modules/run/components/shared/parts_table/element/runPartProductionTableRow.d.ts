import { RunPart, RunStepPart, RunStep } from '@jield/solodb-typescript-core';
declare const RunStepPartProductionTableRow: ({ runPart, runStepParts, runStep, refetchFn, partIsSelected, setPartAsSelected, dropdown, layout, onRunStepPartUpdated, }: {
    runPart: RunPart;
    runStepParts: RunStepPart[];
    runStep: RunStep;
    refetchFn?: () => void;
    partIsSelected?: boolean;
    setPartAsSelected?: (partID: number) => void;
    dropdown?: boolean;
    layout?: "default" | "research";
    onRunStepPartUpdated?: (runStepPart: RunStepPart) => void;
}) => import("react/jsx-runtime").JSX.Element;
export default RunStepPartProductionTableRow;
