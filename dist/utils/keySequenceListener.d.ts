/**
 * Represents a book.
 * key sequence suports := ([a-zA-Z0-9-], * , /)
 */
export declare function makeKeySequenceListener(keySequence: string, callback: (readedKeys: string) => void, currentReadedKeys?: (keys: string) => void): (e: KeyboardEvent) => void;
