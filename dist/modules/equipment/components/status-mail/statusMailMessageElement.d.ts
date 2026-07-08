import { LocationMessage } from '@jield/solodb-typescript-core';
export default function StatusMailMessageElement({ messageList, refetchFn, }: {
    messageList: LocationMessage[];
    refetchFn: () => void;
}): import("react").JSX.Element;
