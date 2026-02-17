import { RunStepPart } from '@jield/solodb-typescript-core';
declare const RunStepPartResearchTableRow: ({ runStepPart, editable, reloadFn, partIsSelected, setPartAsSelected, }: {
    runStepPart: RunStepPart;
    editable?: boolean;
    reloadFn?: () => void;
    partIsSelected?: boolean;
    setPartAsSelected?: (partID: number) => void;
}) => import("react/jsx-runtime").JSX.Element;
export default RunStepPartResearchTableRow;
