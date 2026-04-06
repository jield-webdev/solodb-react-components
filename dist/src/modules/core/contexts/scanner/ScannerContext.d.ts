import { ScannedKeysType } from '../../../../../modules/run/utils/parseScannerForRun';
export interface ScannerContext {
    lastlyReadedKeys: string;
    addCallbackFn: (type: ScannedKeysType, id: string, fun: (readedKeys: string) => void) => void;
    removeCallbackFn: (type: ScannedKeysType, id: string) => void;
    addReadingCallbackFn: (id: string, fun: (readingKeys: string) => void) => void;
    removeReadingCallbackFn: (id: string) => void;
}
export declare const ScannerContext: import('react').Context<ScannerContext>;
export declare const useScannerContext: () => ScannerContext;
