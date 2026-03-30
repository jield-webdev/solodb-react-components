export enum ScannedKeysType {
  SELECT,
  PERFORM_ACTION,
}

export const PERFORM_ACTION_TRIGER = "rpa";

export default function parseScannerForRun(scannedKeys: string): ScannedKeysType {
    if (scannedKeys.includes(PERFORM_ACTION_TRIGER)) {
        return ScannedKeysType.PERFORM_ACTION;
    }
    
    return ScannedKeysType.SELECT;
}
