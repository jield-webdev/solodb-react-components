import { Run, RunStep } from "@jield/solodb-typescript-core";
import StepRemark from "./element/stepRemark";
import RunStepChecklistExecute from "./element/runStepChecklistExecute";
import RunPartsProductionRun from "./element/parts/runPartsProductionRun";
import { RunStepParametersTable } from "../../shared/parameters/runStepParametersTable";

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
      <div style={{ overflow: "visible" }}>
        <h3 className="mb-2 text-start">Parts</h3>
        <RunPartsProductionRun run={run} runStep={runStep} />
      </div>
      <div className="d-flex flex-row flex-wrap gap-2">
        <div className="flex-grow-1">
          <h3 className="mb-2 text-start">Parameters</h3>
          <RunStepParametersTable runStep={runStep} showOnlyEmphasizedParameters={showOnlyEmphasizedParameters} />
        </div>
        <div className="d-flex flex-column gap-2">
          <div className="badge text-dark p-2 text-start">
            <h3 className="mb-2 text-start">Remark</h3>
            <StepRemark runStep={runStep} reloadRunStep={reloadRunStepFn} />
          </div>
          {runStep.has_instructions && runStep.instructions && (
            <div className="badge text-dark p-2 text-start">
              <h3 className="mb-2 text-start">Instructions</h3>
              <span
                dangerouslySetInnerHTML={{
                  __html: runStep.instructions,
                }}
              />
            </div>
          )}
        </div>
      </div>
      <div className="d-flex flex-row flex-wrap gap-2">
        <div className="badge d-block p-2 flex-grow-1">
          <h3 className="mb-2 text-start">Checklist</h3>
          <RunStepChecklistExecute run={run} runStep={runStep} reloadRunStep={reloadRunStepFn} />
        </div>
      </div>
    </>
  );
}
