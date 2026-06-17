import { RunStep, Run } from '@jield/solodb-typescript-core';
export declare const useRunStep: () => {
    run: Run | null;
    runStep: RunStep | null;
    setRunStep: import('react').Dispatch<import('react').SetStateAction<RunStep | null>>;
    reloadRunStep: () => void;
};
