import { RunPart, RunStep, RunStepPart } from '@jield/solodb-typescript-core';
export type RunPartRenderContext = {
    step: RunStep;
    stepPartsById: Map<number, RunStepPart>;
    allowCreate: boolean;
    selectedPartIds: number[];
};
export declare const getBadgeStatusClass: (runPart: RunPart, stepPartsById: Map<number, RunStepPart>) => string;
export declare const PartBadge: ({ runPart, context, }: {
    runPart: RunPart;
    context: RunPartRenderContext;
}) => import("react").JSX.Element;
export declare const MultiPartCell: ({ runParts, context, }: {
    runParts: RunPart[];
    context: RunPartRenderContext;
}) => import("react").JSX.Element;
export declare const SlotCell: ({ runPart, context, }: {
    runPart: RunPart | null;
    context: RunPartRenderContext;
}) => import("react").JSX.Element;
