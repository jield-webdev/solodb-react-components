export type ChatRole = "user" | "assistant";

export interface HistoryMessage {
  role: ChatRole;
  content: string;
}

export interface PostMessageRequest {
  message: string;
  history?: HistoryMessage[];
}

export interface Attachment {
  filename: string;
  content_type: string;
  size: number;
  url: string;
}

export interface PostMessageResponse {
  message: string;
  attachments?: Attachment[];
}

export interface ChatMessage {
  id: number;
  role: ChatRole;
  content: string;
  attachments?: Attachment[];
  error?: string;
}

export interface SseEvent {
  event: string;
  data: string;
}
