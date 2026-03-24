export interface ScannerContext {
    readingKeys: string;
    readedKeys: string;
    addCallbackFn: (id: string, fun: (readedKeys: string) => void) => void;
    removeCallbackFn: (id: string) => void;
}
export declare const ScannerContext: import('react').Context<ScannerContext>;
export declare const useScannerContext: () => ScannerContext;
