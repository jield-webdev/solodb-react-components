import { Run } from '@jield/solodb-typescript-core';
interface RunContext {
    run: Run;
    reloadRun: () => void;
}
export declare const RunContext: import('react').Context<RunContext>;
export {};
