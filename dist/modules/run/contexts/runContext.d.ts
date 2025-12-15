import { Run } from '../interfaces/run';
interface RunContext {
    run: Run;
    reloadRun: () => void;
}
export declare const RunContext: import('react').Context<RunContext>;
export {};
