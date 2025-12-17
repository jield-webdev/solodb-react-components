import { Room, Location } from 'solodb-typescript-core';
/**
 * Checks if a string ends with "/l/" followed by an integer
 * @param {string} url - The URL to check
 * @returns {boolean} - True if the URL ends with "/l/" followed by an integer, false otherwise
 */
export declare function scannedCodeIsLocationCode(url: string): boolean;
/**
 * Extracts the label number if the URL ends with "/l/" followed by an integer
 * @param {string} url - The URL to check
 * @returns {number|null} - The extracted number or null if pattern doesn't match
 */
export declare function extractLabelNumber(url: string): number | null;
export declare const AMOUNT_UNITS: {
    value: string;
    label: string;
}[];
export default function RegisterBarcodeElement({ room, barcode, resetForm, location, setLocation, }: {
    room: Room;
    barcode: string;
    resetForm: () => void;
    location: Location | null;
    setLocation: (location: Location | null) => void;
}): import("react/jsx-runtime").JSX.Element;
