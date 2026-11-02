import { ChatMessage as ChatMessageType } from '../../interfaces/primilla';
interface ChatMessageProps {
    message: ChatMessageType;
    retryDisabled: boolean;
    onRetry: (id: number) => void;
}
export default function ChatMessage({ message, retryDisabled, onRetry }: ChatMessageProps): import("react").JSX.Element;
export {};
