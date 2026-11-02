import { ChatMessage as ChatMessageType } from '../../interfaces/primilla';
interface ChatMessageListProps {
    messages: ChatMessageType[];
    isPending: boolean;
    onRetry: (id: number) => void;
}
export default function ChatMessageList({ messages, isPending, onRetry }: ChatMessageListProps): import("react").JSX.Element;
export {};
