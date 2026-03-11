import { FileUploadEvent } from '@jield/solodb-typescript-core';
export type ContentEntry = [string, string];
export declare function getStateBadgeClass(state: string): string;
export declare function getContentEntries(content: FileUploadEvent["content"]): ContentEntry[];
