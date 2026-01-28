import { Run, RunStep } from "@jield/solodb-typescript-core";
import StepRemark from "./element/stepRemark";
import RunStepChecklistExecute from "./element/runStepChecklistExecute";
import RunPartsProductionRun from "./element/parts/runPartsProductionRun";

export default function RunStepExecuteMinimal({
  run,
  runStep,
  reloadRunStepFn,
}: {
  run: Run;
  runStep: RunStep;
  reloadRunStepFn: () => void;
}) {
  return (
    <>
      <div>
        <h3 className="mb-2 text-start">Parameters</h3>
        <RunPartsProductionRun run={run} runStep={runStep} />
      </div>
      <div className="d-flex flex-row flex-wrap gap-2">
        <div className="badge d-block p-2 flex-grow-1">
          <h3 className="mb-2 text-start">Checklist</h3>
          <RunStepChecklistExecute run={run} runStep={runStep} reloadRunStep={reloadRunStepFn} />
        </div>
        <div className="badge text-dark p-2">
          <h3 className="mb-2 text-start">Remark</h3>
          <StepRemark runStep={runStep} reloadRunStep={reloadRunStepFn}/>
        </div>
      </div>
    </>
  );
}
