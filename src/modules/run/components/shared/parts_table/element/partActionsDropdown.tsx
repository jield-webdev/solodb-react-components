import { Dropdown } from "react-bootstrap";
import { RunStepPartActionEnum } from "@jield/solodb-typescript-core";

export interface PartActionsDropdownProps {
  availableActions: Set<RunStepPartActionEnum>;
  onActionSelected: (action: RunStepPartActionEnum) => void;
  showInitAction?: boolean;
  onInitSelected?: () => void;
}

/**
 * Dropdown component for bulk part actions
 *
 * Renders a dropdown menu with available actions (Start, Finish, Failed, Rework)
 * and optionally an Init action for production runs.
 */
export const PartActionsDropdown = ({
  availableActions,
  onActionSelected,
  showInitAction = false,
  onInitSelected,
}: PartActionsDropdownProps) => {
  if (availableActions.size === 0 && !showInitAction) {
    return null;
  }

  return (
    <Dropdown align="end">
      <Dropdown.Toggle size="sm" variant="secondary">
        Actions
      </Dropdown.Toggle>
      <Dropdown.Menu>
        {showInitAction && onInitSelected && (
          <Dropdown.Item onClick={onInitSelected}>Init</Dropdown.Item>
        )}

        {availableActions.has(RunStepPartActionEnum.START_PROCESSING) && (
          <Dropdown.Item
            onClick={() => onActionSelected(RunStepPartActionEnum.START_PROCESSING)}
          >
            Start
          </Dropdown.Item>
        )}

        {availableActions.has(RunStepPartActionEnum.FINISH_PROCESSING) && (
          <Dropdown.Item
            onClick={() => onActionSelected(RunStepPartActionEnum.FINISH_PROCESSING)}
          >
            Finish
          </Dropdown.Item>
        )}

        {availableActions.has(RunStepPartActionEnum.FAILED_PROCESSING) && (
          <Dropdown.Item
            onClick={() => onActionSelected(RunStepPartActionEnum.FAILED_PROCESSING)}
          >
            Failed
          </Dropdown.Item>
        )}

        {availableActions.has(RunStepPartActionEnum.REWORK) && (
          <Dropdown.Item onClick={() => onActionSelected(RunStepPartActionEnum.REWORK)}>
            Rework
          </Dropdown.Item>
        )}
      </Dropdown.Menu>
    </Dropdown>
  );
};
