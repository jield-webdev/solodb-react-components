import { Run, RunStep, RunTypeEnum } from "@jield/solodb-typescript-core";
import StepRemark from "./element/stepRemark";
import RunStepChecklistExecute from "./element/runStepChecklistExecute";
import RunPartsProductionRun from "./element/parts/runPartsProductionRun";
import { RunStepParametersTable } from "../../shared/parameters/runStepParametersTable";
import UploadFilesToStep from "../../shared/files/uploadFilesToStep";
import RunPartsResearchRun from "@jield/solodb-react-components/modules/run/components/step/view/element/parts/runPartsResearchRun";
import React from "react";

export default function RunStepExecuteMinimal({
  run,
  runStep,
  showOnlyEmphasizedParameters,
  reloadRunStepFn,
}: {
  run: Run;
  runStep: RunStep;
  showOnlyEmphasizedParameters: boolean;
  reloadRunStepFn: () => void;
}) {
  return (
    <>
      <div>
        <h3 className="mb-2 text-start">Parts</h3>
        {run.run_type === RunTypeEnum.RESEARCH && <RunPartsProductionRun run={run} runStep={runStep} />}
        {run.run_type === RunTypeEnum.RESEARCH && <RunPartsResearchRun run={run} runStep={runStep} />}
      </div>

      <h3 className="mt-2">Parameters</h3>
      <RunStepParametersTable runStep={runStep} showOnlyEmphasizedParameters={showOnlyEmphasizedParameters} />

      <div className="row row-cols-2 ">
        <div className={"col"}>
          <StepRemark runStep={runStep} reloadRunStep={reloadRunStepFn} />
        </div>
        <div className={"col"}>
          {runStep.has_instructions && runStep.instructions && (
            <React.Fragment>
              <h3 className="mb-2 text-start">Instructions</h3>
              <span
                dangerouslySetInnerHTML={{
                  __html: runStep.instructions,
                }}
              />
            </React.Fragment>
          )}
        </div>
      </div>

      <h3 className="mt-2">Checklist</h3>
      <RunStepChecklistExecute run={run} runStep={runStep} reloadRunStep={reloadRunStepFn} />

      <h3 className="mt-2">Step files</h3>
      <UploadFilesToStep runStep={runStep} />
    </>
  );
}
