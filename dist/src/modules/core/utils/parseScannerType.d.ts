export declare enum ScannedKeysType {
    WILD_CARD = 0,
    PERFORM_RUN_ACTION = 1,
    RESET_FORM = 2
}
export declare const PERFORM_RUN_ACTION_TRIGER = "_qr";
export declare const RESET_FORM_TRIGER = "reset-form";
export default function parseScannerForRun(scannedKeys: string): ScannedKeysType;
