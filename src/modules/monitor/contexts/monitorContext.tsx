import { createContext } from "react";
import { Monitor } from "solodb-typescript-core";

interface MonitorContext {
  monitor: Monitor;
  reloadMonitor: () => void;
}

export const MonitorContext = createContext<MonitorContext>({
  monitor: {} as Monitor,
  reloadMonitor: () => {},
});
