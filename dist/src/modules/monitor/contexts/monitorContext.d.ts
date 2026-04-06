import { Monitor } from '@jield/solodb-typescript-core';
interface MonitorContext {
    monitor: Monitor;
    reloadMonitor: () => void;
}
export declare const MonitorContext: import('react').Context<MonitorContext>;
export {};
