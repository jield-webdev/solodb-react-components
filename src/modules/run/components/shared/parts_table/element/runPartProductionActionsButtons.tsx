import { Button } from "react-bootstrap";
import { RunStepPartActionEnum, RunStepPart, RunPart, getAvailableRunStepPartActions } from "@jield/solodb-typescript-core";

type Props = {
  runStepPart: RunStepPart;
  runPart: RunPart;
  setRunStepPartAction: ({
    runStepPart,
    runStepPartAction,
  }: {
    runStepPart: RunStepPart;
    runStepPartAction: RunStepPartActionEnum;
  }) => void;
};

const RunPartProductionActionsButtons = ({ runStepPart, runPart, setRunStepPartAction }: Props) => {
  const availableActions = getAvailableRunStepPartActions(runStepPart, runPart);

  return (
    <div className={"d-flex justify-content-between gap-1"}>
      <div className={"d-flex gap-2"}>
        {availableActions.includes(RunStepPartActionEnum.START_PROCESSING) && (
          <Button
            onClick={() =>
              setRunStepPartAction({
                runStepPart: runStepPart,
                runStepPartAction: RunStepPartActionEnum.START_PROCESSING,
              })
            }
            className={"btn-success btn-sm"}
          >
            Start
          </Button>
        )}
        {availableActions.includes(RunStepPartActionEnum.FINISH_PROCESSING) && (
          <Button
            onClick={() =>
              setRunStepPartAction({
                runStepPart: runStepPart,
                runStepPartAction: RunStepPartActionEnum.FINISH_PROCESSING,
              })
            }
            className={"btn-info btn-sm"}
          >
            Finish
          </Button>
        )}
        {availableActions.includes(RunStepPartActionEnum.FAILED_PROCESSING) && (
          <Button
            onClick={() =>
              setRunStepPartAction({
                runStepPart: runStepPart,
                runStepPartAction: RunStepPartActionEnum.FAILED_PROCESSING,
              })
            }
            className={"btn-danger btn-sm"}
          >
            Failed
          </Button>
        )}
        {availableActions.includes(RunStepPartActionEnum.TESTING) && (
          <Button
            onClick={() =>
              setRunStepPartAction({
                runStepPart: runStepPart,
                runStepPartAction: RunStepPartActionEnum.TESTING,
              })
            }
            className={"btn-info btn-sm"}
          >
            Testing
          </Button>
        )}
        {availableActions.includes(RunStepPartActionEnum.REPAIR) && (
          <Button
            onClick={() =>
              setRunStepPartAction({
                runStepPart: runStepPart,
                runStepPartAction: RunStepPartActionEnum.REPAIR,
              })
            }
            className={"btn-warning btn-sm"}
          >
            Repair
          </Button>
        )}
        {availableActions.includes(RunStepPartActionEnum.REWORK) && (
          <Button
            className={"btn-sm"}
            onClick={() =>
              setRunStepPartAction({
                runStepPart: runStepPart,
                runStepPartAction: RunStepPartActionEnum.REWORK,
              })
            }
          >
            Rework
          </Button>
        )}
      </div>
    </div>
  );
};

export default RunPartProductionActionsButtons;
