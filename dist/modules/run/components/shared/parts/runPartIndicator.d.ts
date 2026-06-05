import { RunPart, RunStep, RunStepPart } from '@jield/solodb-typescript-core';
import { default as React } from 'react';
declare const RunPartIndicator: ({ runPart, stepPart, statusClass, withTrayCell, allowCreate, isSelected, runStep, }: {
    runPart: RunPart | null;
    stepPart?: RunStepPart;
    statusClass?: string;
    withTrayCell?: boolean;
    allowCreate?: boolean;
    isSelected?: boolean;
    runStep?: RunStep;
}) => React.JSX.Element | null;
export default RunPartIndicator;
