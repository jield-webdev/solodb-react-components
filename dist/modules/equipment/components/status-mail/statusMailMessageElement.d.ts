import { LocationMessage } from 'solodb-typescript-core';
export default function StatusMailMessageElement({ messageList, refetchFn, }: {
    messageList: LocationMessage[];
    refetchFn: () => void;
}): import("react/jsx-runtime").JSX.Element;
