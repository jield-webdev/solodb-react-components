import { RunPart } from '@jield/solodb-typescript-core';
type ResolvedSlotAnchor = {
    left: number | null;
    trayRow: number | null;
    trayColumn: number | null;
};
type PartLookup = Map<number, RunPart>;
export declare const resolvePartSlotAnchor: (runPart: RunPart | null | undefined, partLookup: PartLookup, cache?: Map<number, ResolvedSlotAnchor>) => ResolvedSlotAnchor;
export declare const buildSplitSlotAssignments: ({ parts, slotCount, getSlotIndex, }: {
    parts: RunPart[];
    slotCount: number;
    getSlotIndex: (runPart: RunPart) => number | null;
}) => RunPart[][];
export declare const buildDisplaySlotIndexByPartId: ({ parts, getOverrideSlotIndex, getDirectSlotIndex, slotCount, }: {
    parts: RunPart[];
    getOverrideSlotIndex?: (runPart: RunPart) => number | null;
    getDirectSlotIndex: (runPart: RunPart) => number | null;
    slotCount?: number;
}) => Map<number, number>;
export {};
