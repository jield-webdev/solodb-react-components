import React, { useState } from "react";
import { useRunStep } from "@jield/solodb-react-components/modules/run/hooks/useRunStep";
import { ModalProperties } from "@jield/solodb-react-components/modules/core/interfaces/modalProperties";
import { RunStepContext } from "@jield/solodb-react-components/modules/run/contexts/runStepContext";

export default function RunStepProvider({ children }: { children: React.ReactNode }) {
  const { runStep, setRunStep, run, reloadRunStep } = useRunStep();
  const [modalProperties, setModalProperties] = useState({} as ModalProperties);

  if (null === runStep || null === run) {
    return (
      <div className={"d-flex justify-content-center h-100 vh-100 flex-row align-items-center"}>
        <div className={"d-flex flex-column align-items-center"}>
          {null === runStep && <h1>Loading run...</h1>}
          {null === run && <h1>Loading run step...</h1>}
          <div className="spinner-border" style={{ width: "3rem", height: "3rem" }} role="status">
            {null === runStep && <span className="visually-hidden">Loading run step...</span>}
            {null === run && <span className="visually-hidden">Loading run...</span>}
          </div>
        </div>
      </div>
    );
  }

  return (
    <RunStepContext.Provider
      value={{
        runStep,
        setRunStep,
        reloadRunStep,
        run,
        modalProperties,
        setModalProperties,
      }}
    >
      {children}
    </RunStepContext.Provider>
  );
}
