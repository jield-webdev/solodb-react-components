import React from "react";
import { Dropdown } from "react-bootstrap";
import { RunStepPartActionEnum, RunStepPart } from "@jield/solodb-typescript-core";

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
  const lastAction = runStepPart.latest_action?.type.id ?? null;
  const showStart = runStepPart.actions === 0 || lastAction === RunStepPartActionEnum.REWORK;
  const showFinishFailed =
    runStepPart.actions > 0 &&
    (lastAction === RunStepPartActionEnum.START_PROCESSING || lastAction === null);
  const showTesting =
    lastAction === RunStepPartActionEnum.FINISH_PROCESSING || lastAction === RunStepPartActionEnum.REPAIR;
  const showRepair =
    lastAction === RunStepPartActionEnum.FAILED_PROCESSING || lastAction === RunStepPartActionEnum.TESTING;
  const showRework =
    lastAction === RunStepPartActionEnum.FINISH_PROCESSING ||
    lastAction === RunStepPartActionEnum.FAILED_PROCESSING ||
    lastAction === RunStepPartActionEnum.REPAIR ||
    lastAction === RunStepPartActionEnum.TESTING;

  return (
    <Dropdown align="end">
      {" "}
      <Dropdown.Toggle size="sm" variant="outline-secondary">
        Actions
      </Dropdown.Toggle>
      <Dropdown.Menu>
        {showStart && (
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
        {showFinishFailed && (
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
        {showFinishFailed && (
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
        {showTesting && (
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
        {showRepair && (
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
        {showRework && (
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
