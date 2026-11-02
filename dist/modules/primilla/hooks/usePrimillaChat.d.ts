import { ChatMessage } from '../interfaces/primilla';
export declare const usePrimillaChat: () => {
    messages: ChatMessage[];
    isPending: boolean;
    sendMessage: (text: string) => void;
    retryMessage: (assistantId: number) => void;
};
