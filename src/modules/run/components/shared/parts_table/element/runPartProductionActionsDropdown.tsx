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
  return (
    <Dropdown align="end">
      {" "}
      <Dropdown.Toggle size="sm" variant="outline-secondary">
        Actions
      </Dropdown.Toggle>
      <Dropdown.Menu>
        {runStepPart.actions === 0 && (
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
        {runStepPart.actions > 0 &&
          runStepPart.latest_action?.type.id !== RunStepPartActionEnum.FINISH_PROCESSING &&
          runStepPart.latest_action?.type.id !== RunStepPartActionEnum.FAILED_PROCESSING && (
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
        {runStepPart.actions > 0 &&
          runStepPart.latest_action?.type.id !== RunStepPartActionEnum.FINISH_PROCESSING &&
          runStepPart.latest_action?.type.id !== RunStepPartActionEnum.FAILED_PROCESSING && (
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
        {runStepPart.actions > 0 && (
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
