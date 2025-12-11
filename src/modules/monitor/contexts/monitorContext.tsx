import { createContext } from "react";
import { Monitor } from "@/modules/monitor/interfaces/monitor";

interface MonitorContext {
  monitor: Monitor;
  reloadMonitor: () => void;
}

export const MonitorContext = createContext<MonitorContext>({
  monitor: {} as Monitor,
  reloadMonitor: () => {},
});
