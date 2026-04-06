import React from "react";
import { Dropdown } from "react-bootstrap";
import { RunStepPart, RunStepPartActionEnum } from "@jield/solodb-typescript-core";

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

const RunPartProductionActionsDropdown = ({
  runStepPart,
  setRunStepPartAction,
  createRunStepPart,
}: Props) => {
  return (
    <Dropdown align="end">
      <Dropdown.Toggle size="sm" variant="outline-secondary">
        Actions
      </Dropdown.Toggle>
      <Dropdown.Menu>
        {runStepPart.available_actions.map(({ id, name }) => (
          <Dropdown.Item
            key={id}
            onClick={() =>
              setRunStepPartAction({
                runStepPart,
                runStepPartAction: id,
              })
            }
          >
            {name}
          </Dropdown.Item>
        ))}
        <Dropdown.Item onClick={() => createRunStepPart()}>Init</Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default RunPartProductionActionsDropdown;
