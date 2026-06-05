import { JSX } from 'react';
import { LocationMessage } from '@jield/solodb-typescript-core';
export default function StatusMailMessageElement({ messageList, refetchFn, }: {
    messageList: LocationMessage[];
    refetchFn: () => void;
}): JSX.Element;
