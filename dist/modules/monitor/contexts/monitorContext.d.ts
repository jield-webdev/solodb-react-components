import { Monitor } from '../interfaces/monitor';
interface MonitorContext {
    monitor: Monitor;
    reloadMonitor: () => void;
}
export declare const MonitorContext: import('react').Context<MonitorContext>;
export {};
