import { Run, RunPart, RunStepPart } from '@jield/solodb-typescript-core';
import { RunPartRenderContext } from './partCell';
type RunTray = NonNullable<Run["run_trays"]>[number];
export declare const TrayGrid: ({ tray, trayParts, trayAllParts, stepParts, isSplitLevel, context, }: {
    tray: RunTray;
    trayParts: RunPart[];
    trayAllParts: RunPart[];
    stepParts: RunStepPart[];
    isSplitLevel: boolean;
    context: RunPartRenderContext;
}) => import("react").JSX.Element;
export {};
