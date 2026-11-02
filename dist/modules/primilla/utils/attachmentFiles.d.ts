import { Attachment } from '../interfaces/primilla';
export declare const isHtmlAttachment: (attachment: Attachment) => boolean;
export declare const fetchAttachmentBlob: (url: string) => Promise<Blob>;
export declare const fetchAttachmentText: (url: string) => Promise<string>;
export declare function saveBlob(blob: Blob, filename: string): void;
export declare function formatFileSize(bytes: number): string;
