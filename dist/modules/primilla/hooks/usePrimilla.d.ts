import { PostMessageRequest, PostMessageResponse } from '../interfaces/primilla';
import { StreamHandlers } from '../utils/streamMessage';
interface SendMessageVariables extends StreamHandlers {
    request: PostMessageRequest;
    signal?: AbortSignal;
}
export declare const usePrimilla: () => import('@tanstack/react-query').UseMutationResult<PostMessageResponse, Error, SendMessageVariables, unknown>;
export {};
