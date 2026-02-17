import React from "react";
import RunPartsResearchRun from "@jield/solodb-react-components/modules/run/components/shared/parts_table/runPartsResearchRun";
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
    <>
      <tr>
        <td colSpan={6}>
          <div className={"d-flex gap-2"}>
            <div style={{ flexGrow: 1, flex: "1 1 50%" }}>
              <RunPartsResearchRun run={run} editable={false} runStep={runStep} />
            </div>
            <div style={{ flexGrow: 1, flex: "1 1 50%" }}>
              {showOnlyEmphasizedParameters && <h4>Emphasized parameters</h4>}
              {!showOnlyEmphasizedParameters && <h4>Parameters</h4>}
              <RunStepParametersTable
                runStep={runStep}
                editableParameters={false}
                showOnlyEmphasizedParameters={showOnlyEmphasizedParameters}
              />
            </div>
          </div>
        </td>
      </tr>
    </>
  );
};

export default StepDetails;
