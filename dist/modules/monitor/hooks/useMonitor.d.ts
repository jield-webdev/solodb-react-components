import { Monitor } from '../interfaces/monitor';
export declare const useMonitor: () => {
    monitor: Monitor | null;
    setMonitor: import('react').Dispatch<import('react').SetStateAction<Monitor | null>>;
    reloadMonitor: () => void;
};
