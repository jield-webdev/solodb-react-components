import { Run } from '@jield/solodb-typescript-core';
export declare const enum FailStatus {
    RunNotFound = "Run not found"
}
export default function useSelectRunWithScanner({ runsList, onFail, }: {
    runsList: Run[];
    onFail?: (status: FailStatus) => void;
}): {
    selectedRun: Run | null;
};
