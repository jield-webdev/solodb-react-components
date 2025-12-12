import { LocationMessage } from '../../../location/interfaces/locationMessage';
export default function StatusMailMessageElement({ messageList, refetchFn, }: {
    messageList: LocationMessage[];
    refetchFn: () => void;
}): import("react/jsx-runtime").JSX.Element;
