export declare function scannedCodeIsLocationCode(url: string): boolean;
export declare function extractLabelNumber(url: string): number | null;
export declare function scannedCodeIsRoomCode(url: string): boolean;
export declare function extractRoomNumber(url: string): number | null;
export declare function normalizeScannedQrCodeContent(content: string): string;
export declare const AMOUNT_UNITS: {
    value: string;
    label: string;
}[];
export declare function getDefaultExpireDate(): string;
