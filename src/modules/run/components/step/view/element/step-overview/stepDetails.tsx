import React from "react";
import RunPartsRegularFlow from "@jield/solodb-react-components/modules/run/components/shared/parts_table/runPartsRegularFlow";
import { RunStepParametersTable } from "@jield/solodb-react-components/modules/run/components/shared/parameters/runStepParametersTable";
import { Run, RunStep } from "@jield/solodb-typescript-core";

const StepDetails = ({
  run,
  runStep,
  showOnlyEmphasizedParameters,
}: {
  run: Run;
  runStep: RunStep;
  showOnlyEmphasizedParameters: boolean;
}) => {
  return (
    <div className="border rounded px-3 py-3">
      <div className="d-flex flex-wrap gap-3">
        <div style={{ flexGrow: 1, flex: "1 1 360px" }}>
          <RunPartsRegularFlow run={run} runStep={runStep} />
        </div>
        <div style={{ flexGrow: 1, flex: "1 1 360px" }}>
          {showOnlyEmphasizedParameters && <h4>Emphasized parameters</h4>}
          {!showOnlyEmphasizedParameters && <h4>Parameters</h4>}
          <RunStepParametersTable
            runStep={runStep}
            editableParameters={false}
            showOnlyEmphasizedParameters={showOnlyEmphasizedParameters}
          />
        </div>
      </div>
    </div>
  );
};

export default StepDetails;
