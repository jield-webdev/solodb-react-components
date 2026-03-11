import { FileUploadEvent } from '@jield/solodb-typescript-core';
interface IrisOperatorEventListProps {
    activeContext: string;
    events: FileUploadEvent[];
    selectedEventUid: string;
    onSelectEvent: (uid: string) => void;
}
export default function IrisOperatorEventList({ activeContext, events, selectedEventUid, onSelectEvent, }: IrisOperatorEventListProps): import("react/jsx-runtime").JSX.Element;
export {};
