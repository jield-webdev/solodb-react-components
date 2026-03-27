import { Button, Dropdown } from "react-bootstrap";
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
 * Renders a dropdown menu with available actions (Start, Finish, Failed, Repair, Testing, Rework)
 * and optionally an Init action for production runs.
 */
export const PartActionsButtons = ({
  availableActions,
  onActionSelected,
  showInitAction = false,
  onInitSelected,
}: PartActionsDropdownProps) => {
  if (availableActions.size === 0 && !showInitAction) {
    return null;
  }

  return (
    <div className="d-flex justify-content-between gap-1">
      <div className="d-flex gap-2">
        {showInitAction && onInitSelected && <Button className="btn-info btn-sm" onClick={onInitSelected}>Init</Button>}

        {availableActions.has(RunStepPartActionEnum.START_PROCESSING) && (
          <Button className="btn-success btn-sm" onClick={() => onActionSelected(RunStepPartActionEnum.START_PROCESSING)}>Start</Button>
        )}

        {availableActions.has(RunStepPartActionEnum.FINISH_PROCESSING) && (
          <Button className="btn-info btn-sm" onClick={() => onActionSelected(RunStepPartActionEnum.FINISH_PROCESSING)}>
            Finish
          </Button>
        )}

        {availableActions.has(RunStepPartActionEnum.FAILED_PROCESSING) && (
          <Button className="btn-danger btn-sm" onClick={() => onActionSelected(RunStepPartActionEnum.FAILED_PROCESSING)}>
            Failed
          </Button>
        )}

        {availableActions.has(RunStepPartActionEnum.REPAIR) && (
          <Button className="btn-warning btn-sm" onClick={() => onActionSelected(RunStepPartActionEnum.REPAIR)}>Repair</Button>
        )}

        {availableActions.has(RunStepPartActionEnum.TESTING) && (
          <Button className="btn-info btn-sm" onClick={() => onActionSelected(RunStepPartActionEnum.TESTING)}>Testing</Button>
        )}

        {availableActions.has(RunStepPartActionEnum.REWORK) && (
          <Button className={"btn-primary btn-sm"} onClick={() => onActionSelected(RunStepPartActionEnum.REWORK)}>Rework</Button>
        )}
      </div>
    </div>
  );
};
