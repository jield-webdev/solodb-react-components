import React from "react";
import { useRun } from "@jield/solodb-react-components/modules/run/hooks/useRun";
import { RunContext } from "@jield/solodb-react-components/modules/run/contexts/runContext";

export default function RunProvider({ children }: { children: React.ReactNode }) {
  const { run, reloadRun } = useRun();

  if (null === run) {
    return (
      <div className={"d-flex justify-content-center h-100 vh-100 flex-row align-items-center"}>
        <div className={"d-flex flex-column align-items-center"}>
          <h1>Loading run</h1>
          <div className="spinner-border" style={{ width: "3rem", height: "3rem" }} role="status">
            <span className="visually-hidden">Loading run</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <RunContext.Provider
      value={{
        run,
        reloadRun,
      }}
    >
      {children}
    </RunContext.Provider>
  );
}
