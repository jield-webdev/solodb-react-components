export enum ScannedKeysType {
  SELECT,
  PERFORM_ACTION,
}

export const PERFORM_ACTION_TRIGER = "_qr";

export default function parseScannerForRun(scannedKeys: string): ScannedKeysType {
    if (scannedKeys.startsWith(PERFORM_ACTION_TRIGER)) {
        return ScannedKeysType.PERFORM_ACTION;
    }
    
    return ScannedKeysType.SELECT;
}
