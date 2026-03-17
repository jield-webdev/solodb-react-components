import { FileUploadEvent } from '@jield/solodb-typescript-core';
interface IrisStreamContextEventsOptions {
    irisEndpoint: string;
    context: string;
    onMessage: (data: FileUploadEvent) => void;
    onError: (error: Event | null) => void;
}
export declare function useIrisStreamContextEvents({ irisEndpoint, context, onMessage, onError, }: IrisStreamContextEventsOptions): {
    isConnected: boolean;
    close: () => void;
};
export {};
