import React from "react";
import { Dropdown } from "react-bootstrap";
import { RunStepPartActionEnum, RunStepPart, RunPart, getAvailableRunStepPartActions } from "@jield/solodb-typescript-core";

type Props = {
  runStepPart: RunStepPart;
  createRunStepPart: () => void;
  setRunStepPartAction: ({
    runStepPart,
    runStepPartAction,
  }: {
    runStepPart: RunStepPart;
    runStepPartAction: RunStepPartActionEnum;
  }) => void;
};

const RunPartProductionActionsDropdown = ({ runStepPart, setRunStepPartAction, createRunStepPart }: Props) => {
  const availableActions = getAvailableRunStepPartActions(runStepPart);

  return (
    <Dropdown align="end">
      {" "}
      <Dropdown.Toggle size="sm" variant="outline-secondary">
        Actions
      </Dropdown.Toggle>
      <Dropdown.Menu>
        {availableActions.includes(RunStepPartActionEnum.START_PROCESSING) && (
          <Dropdown.Item
            onClick={() =>
              setRunStepPartAction({
                runStepPart: runStepPart,
                runStepPartAction: RunStepPartActionEnum.START_PROCESSING,
              })
            }
          >
            Start
          </Dropdown.Item>
        )}
        {availableActions.includes(RunStepPartActionEnum.FINISH_PROCESSING) && (
          <Dropdown.Item
            onClick={() =>
              setRunStepPartAction({
                runStepPart: runStepPart,
                runStepPartAction: RunStepPartActionEnum.FINISH_PROCESSING,
              })
            }
          >
            Finish
          </Dropdown.Item>
        )}
        {availableActions.includes(RunStepPartActionEnum.FAILED_PROCESSING) && (
          <Dropdown.Item
            onClick={() =>
              setRunStepPartAction({
                runStepPart: runStepPart,
                runStepPartAction: RunStepPartActionEnum.FAILED_PROCESSING,
              })
            }
          >
            Failed
          </Dropdown.Item>
        )}
        {availableActions.includes(RunStepPartActionEnum.TESTING) && (
          <Dropdown.Item
            onClick={() =>
              setRunStepPartAction({
                runStepPart: runStepPart,
                runStepPartAction: RunStepPartActionEnum.TESTING,
              })
            }
          >
            Testing
          </Dropdown.Item>
        )}
        {availableActions.includes(RunStepPartActionEnum.REPAIR) && (
          <Dropdown.Item
            onClick={() =>
              setRunStepPartAction({
                runStepPart: runStepPart,
                runStepPartAction: RunStepPartActionEnum.REPAIR,
              })
            }
          >
            Repair
          </Dropdown.Item>
        )}
        {availableActions.includes(RunStepPartActionEnum.REWORK) && (
          <Dropdown.Item
            onClick={() =>
              setRunStepPartAction({
                runStepPart: runStepPart,
                runStepPartAction: RunStepPartActionEnum.REWORK,
              })
            }
          >
            Rework
          </Dropdown.Item>
        )}
        <Dropdown.Item onClick={() => createRunStepPart()}>Init</Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default RunPartProductionActionsDropdown;
