import { Dropdown } from "react-bootstrap";
import { RunStepPartActionEnum } from "@jield/solodb-typescript-core";

export interface PartActionsDropdownProps {
  availableActions: { id: RunStepPartActionEnum; name: string }[];
  onActionSelected: (action: RunStepPartActionEnum) => void;
}

/**
 * Dropdown component for bulk part actions.
 *
 * Renders a dropdown menu driven by the server-provided `available_actions` array.
 */
export const PartActionsDropdown = ({ availableActions, onActionSelected }: PartActionsDropdownProps) => {
  if (availableActions.length === 0) return null;

  return (
    <Dropdown align="end">
      <Dropdown.Toggle size="sm" variant="secondary">
        Actions
      </Dropdown.Toggle>
      <Dropdown.Menu>
        {availableActions.map(({ id, name }) => (
          <Dropdown.Item key={id} onClick={() => onActionSelected(id)}>
            {name}
          </Dropdown.Item>
        ))}
      </Dropdown.Menu>
    </Dropdown>
  );
};
