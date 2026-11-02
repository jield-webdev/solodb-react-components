interface ChatInputProps {
    disabled: boolean;
    onSend: (message: string) => void;
}
export default function ChatInput({ disabled, onSend }: ChatInputProps): import("react").JSX.Element;
export {};
