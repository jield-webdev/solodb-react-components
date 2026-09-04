import { Run, RunPart, RunStepPart, TrayType } from '@jield/solodb-typescript-core';
type CoreRunTray = NonNullable<Run["run_trays"]>[number];
export type RunTray = CoreRunTray & {
    extra_tray_id: number;
};
export declare const getExtraTrayId: (tray: CoreRunTray) => number;
export declare const PLACEHOLDER_EXTRA_TRAY_ID = -1;
export declare const getNormalTrays: (run: Run) => RunTray[];
export declare const getExtraTrays: (run: Run) => RunTray[];
export declare const getOrderedTrays: (run: Run) => RunTray[];
export declare const isPlaceholderExtraTray: (tray: RunTray) => boolean;
export declare const getNextExtraTrayId: (extraTrays: RunTray[]) => number;
export declare const buildPlaceholderExtraTray: (run: Run, extraTrayId: number) => RunTray | null;
export declare const resolveTrayForUpdate: (run: Run, tray: RunTray) => RunTray | null;
export declare const getTrayIdPerStepPart: (part: RunPart, stepPart: RunStepPart | null | undefined) => number;
export declare const groupPartsByTrayId: (parts: RunPart[], stepParts: RunStepPart[]) => Map<number, RunPart[]>;
export declare const getSlotIndex: (trayType: TrayType, row: number | null, column: number | null) => number | null;
export declare const getSlotPosition: (trayType: TrayType, slotIndex: number) => {
    row: number;
    column: number;
};
export declare const getForbiddenSlotIndices: (trayType: TrayType) => Set<number>;
export declare const getStepPartSlotPriority: (stepPart: RunStepPart | null | undefined) => number;
export declare const buildTraySlots: (trayType: TrayType, trayParts: RunPart[], stepParts: RunStepPart[]) => (RunStepPart | null)[];
export declare const isTrayFull: (slots: (RunStepPart | null)[], trayType: TrayType) => boolean;
export {};
