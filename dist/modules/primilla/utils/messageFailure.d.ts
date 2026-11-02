import { ChatMessage } from '../interfaces/primilla';
export declare function getMessageFailure(error: unknown): Pick<ChatMessage, "error" | "retryAction">;
