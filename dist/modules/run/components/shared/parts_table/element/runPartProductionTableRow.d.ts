import { RunPart, RunStepPart, RunStep } from '@jield/solodb-typescript-core';
type Props = {
    runPart: RunPart;
    partIsSelected?: boolean;
    setPartAsSelected?: (partID: number) => void;
    runStepParts: RunStepPart[];
    canInit: boolean;
    runStep: RunStep;
    refetchFn?: () => void;
    dropdown: boolean;
    onRunStepPartUpdated?: (runStepPart: RunStepPart) => void;
};
declare const RunStepPartProductionTableRow: (props: Props) => import("react/jsx-runtime").JSX.Element | null;
export default RunStepPartProductionTableRow;
