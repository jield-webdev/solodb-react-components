import { RunStep, Run } from '../../../../../solodb-typescript-core/src/index.ts';
export declare const useRunStep: () => {
    run: Run | null;
    runStep: RunStep | null;
    setRunStep: import('react').Dispatch<import('react').SetStateAction<RunStep | null>>;
    reloadRunStep: () => void;
};
