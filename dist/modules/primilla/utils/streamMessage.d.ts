import { PostMessageRequest, PostMessageResponse, ToolEvent } from '../interfaces/primilla';
export interface StreamHandlers {
    onChunk: (chunk: string) => void;
    onTool: (event: ToolEvent) => void;
}
export declare function streamMessage(request: PostMessageRequest, { onChunk, onTool }: StreamHandlers, signal?: AbortSignal): Promise<PostMessageResponse>;
