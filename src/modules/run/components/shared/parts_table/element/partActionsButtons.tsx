import { RunStepPartActionEnum } from "@jield/solodb-typescript-core";
import { ACTION_VARIANT } from "./partActionVariants";

export interface PartActionsButtonsProps {
  availableActions: { id: RunStepPartActionEnum; name: string }[];
  onActionSelected: (action: RunStepPartActionEnum) => void;
}

export const PartActionsButtons = ({ availableActions, onActionSelected }: PartActionsButtonsProps) => {
  if (availableActions.length === 0) return null;

  console.log(availableActions);

  return (
    <div className="btn-group btn-group-sm" role="group" aria-label="Bulk part actions">
      {availableActions.map(({ id, name }) => (
        <button
          key={id}
          type="button"
          className={`btn ${ACTION_VARIANT[id]}`}
          onClick={() => onActionSelected(id)}
        >
          {name}
        </button>
      ))}
    </div>
  );
};
