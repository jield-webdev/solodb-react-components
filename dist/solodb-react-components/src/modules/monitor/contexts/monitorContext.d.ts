import { Monitor } from '../../../../../solodb-typescript-core/src/index.ts';
interface MonitorContext {
    monitor: Monitor;
    reloadMonitor: () => void;
}
export declare const MonitorContext: import('react').Context<MonitorContext>;
export {};
