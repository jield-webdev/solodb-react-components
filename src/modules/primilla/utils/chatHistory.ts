import { ChatMessage, HistoryMessage } from "../interfaces/primilla";

export const toHistory = (messages: ChatMessage[]): HistoryMessage[] =>
  messages
    .filter((message) => !message.error && message.content.trim())
    .map(({ role, content }) => ({ role, content }));
