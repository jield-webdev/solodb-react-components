import { RunPart, RunStep, RunStepPart } from '@jield/solodb-typescript-core';
type Props = {
    runPart: RunPart;
    partIsSelected?: boolean;
    setPartAsSelected?: (partID: number) => void;
    runStepParts: RunStepPart[];
    canInit: boolean;
    runStep: RunStep;
    dropdown: boolean;
};
declare const RunStepPartProductionTableRow: ({ runPart, partIsSelected, setPartAsSelected, runStepParts, canInit, runStep, dropdown, }: Props) => import("react/jsx-runtime").JSX.Element | null;
export default RunStepPartProductionTableRow;
