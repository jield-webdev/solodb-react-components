import { RunTypeEnum } from "@/modules/run/interfaces/run";
import BatchCardElement from "@/modules/run/components/step/view/element/batchCardElement";
import React, { useContext } from "react";
import { RunContext } from "@/modules/run/contexts/runContext";

export default function RunHeader() {
  const { run } = useContext(RunContext);

  return (
    <>
      {run.run_type === RunTypeEnum.RESEARCH && <small>Research run</small>}
      {run.run_type === RunTypeEnum.PRODUCTION && <small>Production run</small>}

      <div className={"d-flex justify-content-between align-items-center mb-3"}>
        <h1 className={"display-4"}>
          {run.name} ({run.project.name})
        </h1>
      </div>

      <BatchCardElement run={run} />
    </>
  );
}
