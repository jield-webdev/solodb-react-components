import { FileUploadEvent } from '@jield/solodb-typescript-core';
import { ContentEntry } from './irisOperatorDashboardUtils';
interface IrisOperatorEventDetailsProps {
    event: FileUploadEvent | null;
    contentEntries: ContentEntry[];
    irisEndpoint: string;
    onEventUpdated: (nextEvent: FileUploadEvent) => void;
}
export default function IrisOperatorEventDetails({ event, contentEntries, irisEndpoint, onEventUpdated, }: IrisOperatorEventDetailsProps): import("react/jsx-runtime").JSX.Element;
export {};
