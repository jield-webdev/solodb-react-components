import { ToolCall } from '../../interfaces/primilla';
interface ToolActivityProps {
    calls: ToolCall[];
    isStreaming: boolean;
}
export default function ToolActivity({ calls, isStreaming }: ToolActivityProps): import("react").JSX.Element;
export {};
