import { RunStep } from '../interfaces/runStep';
import { Run } from '../interfaces/run';
export declare const useRunStep: () => {
    run: Run | null;
    runStep: RunStep | null;
    setRunStep: import('react').Dispatch<import('react').SetStateAction<RunStep | null>>;
    reloadRunStep: () => void;
};
