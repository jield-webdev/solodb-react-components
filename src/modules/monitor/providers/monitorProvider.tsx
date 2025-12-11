import React from "react";
import { useMonitor } from "@/modules/monitor/hooks/useMonitor";
import { MonitorContext } from "@/modules/monitor/contexts/monitorContext";

export default function MonitorProvider({ children }: { children: React.ReactNode }) {
  const { monitor, reloadMonitor } = useMonitor();

  if (null === monitor) {
    return (
      <div className={"d-flex justify-content-center h-100 vh-100 flex-row align-items-center"}>
        <div className={"d-flex flex-column align-items-center"}>
          <h1>Loading Monitor</h1>
          <div className="spinner-border" style={{ width: "3rem", height: "3rem" }} role="status">
            <span className="visually-hidden">Loading monitor</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <MonitorContext.Provider
      value={{
        monitor,
        reloadMonitor,
      }}
    >
      {children}
    </MonitorContext.Provider>
  );
}
