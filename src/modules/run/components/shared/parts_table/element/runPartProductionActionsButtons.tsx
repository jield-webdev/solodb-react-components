import React from "react";
import { Button, Dropdown } from "react-bootstrap";
import { RunStepPartActionEnum, RunStepPart } from "@jield/solodb-typescript-core";

type Props = {
  runStepPart: RunStepPart;
  setRunStepPartAction: ({
    runStepPart,
    runStepPartAction,
  }: {
    runStepPart: RunStepPart;
    runStepPartAction: RunStepPartActionEnum;
  }) => void;
};

const RunPartProductionActionsDropdown = ({ runStepPart, setRunStepPartAction }: Props) => {
  return (
    <div className={"d-flex justify-content-between gap-1"}>
      <div className={"d-flex gap-2"}>
        {runStepPart.actions === 0 && (
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
        {runStepPart.actions > 0 &&
          runStepPart.latest_action?.type.id !== RunStepPartActionEnum.FINISH_PROCESSING &&
          runStepPart.latest_action?.type.id !== RunStepPartActionEnum.FAILED_PROCESSING && (
            <Button
              onClick={() =>
                setRunStepPartAction({
                  runStepPart: runStepPart,
                  runStepPartAction: RunStepPartActionEnum.FINISH_PROCESSING,
                })
              }
              className={"btn-primary btn-sm"}
            >
              Finish
            </Button>
          )}
        {runStepPart.actions > 0 &&
          runStepPart.latest_action?.type.id !== RunStepPartActionEnum.FINISH_PROCESSING &&
          runStepPart.latest_action?.type.id !== RunStepPartActionEnum.FAILED_PROCESSING && (
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
        {runStepPart.actions > 0 && runStepPart.latest_action?.type.id !== RunStepPartActionEnum.FINISH_PROCESSING && (
          <Button
            size={"sm"}
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

export default RunPartProductionActionsDropdown;
