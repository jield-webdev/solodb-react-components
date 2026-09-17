export declare const useRun: () => {
    run: import('@jield/solodb-typescript-core').Run | null;
    isError: boolean;
    canRetry: boolean;
    error: Error | null;
    reloadRun: () => void;
};
