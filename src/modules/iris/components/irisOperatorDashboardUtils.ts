import { FileUploadEvent } from "@jield/solodb-typescript-core";

export type ContentEntry = [string, string];

const STATE_BADGE_CLASS_MAP: Record<string, string> = {
  active: "text-bg-warning",
  approved: "text-bg-success",
  canceled: "text-bg-secondary",
  cancelled: "text-bg-secondary",
  completed: "text-bg-success",
  done: "text-bg-success",
  error: "text-bg-danger",
  expired: "text-bg-secondary",
  failed: "text-bg-danger",
  pending: "text-bg-warning",
  processing: "text-bg-warning",
  queued: "text-bg-warning",
  rejected: "text-bg-danger",
  running: "text-bg-warning",
  skipped: "text-bg-secondary",
  started: "text-bg-warning",
  success: "text-bg-success",
  uploaded: "text-bg-success",
};

export function getStateBadgeClass(state: string): string {
  const normalizedState = state.trim().toLowerCase();

  if (normalizedState in STATE_BADGE_CLASS_MAP) {
    return STATE_BADGE_CLASS_MAP[normalizedState];
  }

  if (/(fail|error|reject|invalid|deny)/.test(normalizedState)) {
    return "text-bg-danger";
  }

  if (/(complete|done|success|approve|upload|finish|ready|ok)/.test(normalizedState)) {
    return "text-bg-success";
  }

  if (/(run|process|progress|pending|queue|start|wait|active)/.test(normalizedState)) {
    return "text-bg-warning";
  }

  if (/(cancel|skip|expire|close|stop)/.test(normalizedState)) {
    return "text-bg-secondary";
  }

  return "text-bg-info";
}

export function getContentEntries(content: FileUploadEvent["content"] | null | undefined): ContentEntry[] {
  if (!content) {
    return [];
  }

  return Object.entries(content);
}
