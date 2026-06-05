import { Run, RunPart, RunStep, RunStepPart } from '@jield/solodb-typescript-core';
export declare const getTrayIdPerStepPart: (part: RunPart, stepPart: RunStepPart | null | undefined) => number;
export declare const groupPartsByTrayId: (parts: RunPart[], stepParts: RunStepPart[]) => Map<number, RunPart[]>;
export declare const RunPartList: ({ step, parts, stepParts, run, }: {
    step: RunStep;
    parts: RunPart[];
    stepParts: RunStepPart[];
    run: Run;
}) => import("react").JSX.Element;
