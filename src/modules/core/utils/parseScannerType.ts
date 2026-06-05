export enum ScannedKeysType {
  WILD_CARD,
  PERFORM_RUN_ACTION,
  RESET_FORM,
}

export const PERFORM_RUN_ACTION_TRIGER = "_qr";

export const RESET_FORM_TRIGER = "reset-form";

export default function parseScannerForRun(scannedKeys: string): ScannedKeysType {
    if (scannedKeys.startsWith(PERFORM_RUN_ACTION_TRIGER)) {
        return ScannedKeysType.PERFORM_RUN_ACTION;
    }

    if (scannedKeys.toUpperCase().includes(RESET_FORM_TRIGER.toUpperCase())) {
        return ScannedKeysType.RESET_FORM;
    }
    
    return ScannedKeysType.WILD_CARD;
}
