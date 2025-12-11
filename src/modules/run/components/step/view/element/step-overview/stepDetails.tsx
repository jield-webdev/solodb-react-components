import React from "react";
import RunPartsResearchRun from "@/modules/run/components/step/view/element/parts/runPartsResearchRun";
import { RunStep } from "@/modules/run/interfaces/runStep";
import { RunStepParametersTable } from "@/modules/run/components/shared/parameters/runStepParametersTable";
import { Run } from "@/modules/run/interfaces/run";

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
