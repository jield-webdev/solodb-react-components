import { createContext } from "react";
import { Monitor } from "@jield/solodb-typescript-core";

interface MonitorContext {
  monitor: Monitor;
  reloadMonitor: () => void;
}

export const MonitorContext = createContext<MonitorContext>({
  monitor: {} as Monitor,
  reloadMonitor: () => {},
});
