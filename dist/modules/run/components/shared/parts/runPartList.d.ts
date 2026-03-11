import { RunStep, RunPart, RunStepPart, Run } from '@jield/solodb-typescript-core';
export declare const RunPartList: ({ step, parts, stepParts, run, reloadFn, }: {
    step: RunStep;
    parts: RunPart[];
    stepParts: RunStepPart[];
    run: Run;
    reloadFn?: () => void;
}) => import("react/jsx-runtime").JSX.Element;
