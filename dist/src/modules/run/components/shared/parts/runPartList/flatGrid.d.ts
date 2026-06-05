import { RunPart } from '@jield/solodb-typescript-core';
import { RunPartRenderContext } from './partCell';
/**
 * Renders parts that are not assigned to any tray as a simple wrapping grid.
 * Used when the run has no trays.
 */
export declare const FlatGrid: ({ leveledParts, allNonTrayParts, isSplitLevel, context, }: {
    leveledParts: RunPart[];
    allNonTrayParts: RunPart[];
    isSplitLevel: boolean;
    context: RunPartRenderContext;
}) => import("react/jsx-runtime").JSX.Element;
