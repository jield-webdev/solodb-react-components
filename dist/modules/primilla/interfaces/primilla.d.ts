export type ChatRole = "user" | "assistant";
export interface PostMessageRequest {
    message: string;
    conversation_id?: string | null;
}
export interface Attachment {
    filename: string;
    content_type: string;
    size: number;
    url: string;
}
export interface PostMessageResponse {
    conversation_id: string;
    message: string;
    attachments?: Attachment[];
}
export interface ToolEvent {
    name: string;
    state: "start" | "done" | "error";
}
export interface ToolCall {
    id: number;
    name: string;
    state: "running" | "done" | "error";
    awaitingStart?: boolean;
}
export interface ToolCallGroup extends Pick<ToolCall, "id" | "name" | "state"> {
    count: number;
}
export interface ChatMessage {
    id: number;
    role: ChatRole;
    content: string;
    attachments?: Attachment[];
    toolCalls?: ToolCall[];
    isStreaming?: boolean;
    isFailed?: boolean;
    error?: string;
    retryAction?: "retry" | "start-fresh";
}
export interface SseEvent {
    event: string;
    data: string;
}
