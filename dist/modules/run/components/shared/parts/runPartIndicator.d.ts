import { RunPart, RunStep } from '@jield/solodb-typescript-core';
declare const RunPartIndicator: ({ runPart, statusClass, withTrayCell, allowCreate, hasStepPart, isSelected, runStep, reloadFn, }: {
    runPart: RunPart | null;
    statusClass?: string;
    withTrayCell?: boolean;
    allowCreate?: boolean;
    hasStepPart?: boolean;
    isSelected?: boolean;
    runStep?: RunStep;
    reloadFn?: () => void;
}) => import("react/jsx-runtime").JSX.Element | null;
export default RunPartIndicator;
