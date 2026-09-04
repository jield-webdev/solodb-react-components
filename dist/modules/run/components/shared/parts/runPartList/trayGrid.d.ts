import { RunPart, RunStepPart } from '@jield/solodb-typescript-core';
import { RunTray } from '../../../../utils/runTrays';
import { RunPartRenderContext } from './partCell';
export declare const TrayGrid: ({ tray, trayParts, trayAllParts, stepParts, isSplitLevel, context, }: {
    tray: RunTray;
    trayParts: RunPart[];
    trayAllParts: RunPart[];
    stepParts: RunStepPart[];
    isSplitLevel: boolean;
    context: RunPartRenderContext;
}) => import("react").JSX.Element;
