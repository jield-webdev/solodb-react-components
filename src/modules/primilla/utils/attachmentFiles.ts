import { Attachment } from "../interfaces/primilla";
import { primillaFetch } from "./primillaApi";

export const isHtmlAttachment = (attachment: Attachment): boolean => attachment.content_type.startsWith("text/html");

export const fetchAttachmentBlob = async (url: string): Promise<Blob> => (await primillaFetch(url)).blob();

export const fetchAttachmentText = async (url: string): Promise<string> => (await primillaFetch(url)).text();

export function saveBlob(blob: Blob, filename: string) {
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = objectUrl;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(objectUrl);
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
