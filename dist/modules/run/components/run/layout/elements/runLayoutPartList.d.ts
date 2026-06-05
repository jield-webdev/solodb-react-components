import { Run, RunPart, RunStep, RunStepPart } from '@jield/solodb-typescript-core';
<<<<<<< HEAD:dist/src/modules/run/components/shared/parts/runPartList.d.ts
export declare const getTrayIdPerStepPart: (part: RunPart, stepPart: RunStepPart | null | undefined) => number;
export declare const groupPartsByTrayId: (parts: RunPart[], stepParts: RunStepPart[]) => Map<number, RunPart[]>;
export declare const RunPartList: ({ step, parts, stepParts, run, }: {
=======
export declare const RunLayoutPartList: ({ step, parts, stepParts, run, }: {
>>>>>>> b14f055c323c6a988999f5f07c1e5ba9a360fe44:dist/modules/run/components/run/layout/elements/runLayoutPartList.d.ts
    step: RunStep;
    parts: RunPart[];
    stepParts: RunStepPart[];
    run: Run;
}) => import("react").JSX.Element;
