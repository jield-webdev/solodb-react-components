import { RunPart, RunStep, RunStepPart } from '@jield/solodb-typescript-core';
declare const RunPartIndicator: ({ runPart, stepPart, statusClass, withTrayCell, allowCreate, isSelected, runStep, }: {
    runPart: RunPart | null;
    stepPart?: RunStepPart;
    statusClass?: string;
    withTrayCell?: boolean;
    allowCreate?: boolean;
    isSelected?: boolean;
    runStep?: RunStep;
}) => import("react/jsx-runtime").JSX.Element | null;
export default RunPartIndicator;
