import { RunPart, RunStep } from '@jield/solodb-typescript-core';
declare const RunPartIndicator: ({ runPart, statusClass, withTrayCell, allowCreate, hasStepPart, isSelected, runStep, }: {
    runPart: RunPart | null;
    statusClass?: string;
    withTrayCell?: boolean;
    allowCreate?: boolean;
    hasStepPart?: boolean;
    isSelected?: boolean;
    runStep?: RunStep;
}) => import("react/jsx-runtime").JSX.Element | null;
export default RunPartIndicator;
