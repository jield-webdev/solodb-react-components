import { ToolCall, ToolCallGroup, ToolEvent } from '../interfaces/primilla';
export declare function applyToolEvent(calls: ToolCall[], { name, state }: ToolEvent): ToolCall[];
export declare const closeToolCalls: (calls?: ToolCall[]) => ToolCall[] | undefined;
export declare const getLatestToolCall: (calls: ToolCall[]) => ToolCall | undefined;
export declare const groupToolCalls: (calls: ToolCall[]) => ToolCallGroup[];
