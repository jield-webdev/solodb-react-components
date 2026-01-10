import { RunStepPart } from '../../../../../../../solodb-typescript-core/src/index.ts';
declare const RunStepPartTableRow: ({ runStepPart, editable, reloadFn, partIsSelected, setPartAsSelected, }: {
    runStepPart: RunStepPart;
    editable?: boolean;
    reloadFn?: () => void;
    partIsSelected?: boolean;
    setPartAsSelected?: (partID: number) => void;
}) => import("react/jsx-runtime").JSX.Element;
export default RunStepPartTableRow;
