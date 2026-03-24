/**
 * Represents a book.
 * key sequence supports := ([a-zA-Z0-9-], * , /)
 */
export declare function makeKeySequenceListener(keySequence: string, callback: (readKeys: string) => void, currentReadKeys?: (keys: string) => void, options?: {
    requireEndCharacter?: boolean;
}): (e: KeyboardEvent) => void;
