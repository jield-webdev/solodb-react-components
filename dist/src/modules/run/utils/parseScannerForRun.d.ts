export declare enum ScannedKeysType {
    SELECT = 0,
    PERFORM_ACTION = 1
}
export declare const PERFORM_ACTION_TRIGER = "_qr";
export default function parseScannerForRun(scannedKeys: string): ScannedKeysType;
