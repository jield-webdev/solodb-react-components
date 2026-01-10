import { RunPart, RunStepPart, RunStep } from '../../../../../../../../../../solodb-typescript-core/src/index.ts';
declare const RunStepPartProductionTableRow: ({ runPart, runStepParts, runStep, refetchFn, partIsSelected, setPartAsSelected, }: {
    runPart: RunPart;
    runStepParts: RunStepPart[];
    runStep: RunStep;
    refetchFn?: () => void;
    partIsSelected?: boolean;
    setPartAsSelected?: (partID: number) => void;
}) => import("react/jsx-runtime").JSX.Element;
export default RunStepPartProductionTableRow;
