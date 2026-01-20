import { Run, RunStep } from "@jield/solodb-typescript-core";
import { RunStepParametersTable } from "../../shared/parameters/runStepParametersTable";
import RunStepChecklist from "../view/element/runStepChecklist";

export default function RunStepExecuteMinimal({run, runStep, showOnlyEmphasizedParameters, refetchFn }: {run: Run; runStep: RunStep; showOnlyEmphasizedParameters: boolean; refetchFn: () => void}) {
    return <>
        <RunStepParametersTable runStep={runStep} showOnlyEmphasizedParameters={showOnlyEmphasizedParameters} />
        <RunStepChecklist run={run} runStep={runStep} reloadRunStep={() => null} movePage={false}/>
    </>
}
