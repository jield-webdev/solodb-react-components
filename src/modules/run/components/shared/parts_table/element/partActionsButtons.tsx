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
    <>
      {availableActions.map(({ id, name }) => (
        <button
          key={id}
          type="button"
          className={`btn btn-sm ${ACTION_VARIANT[id]}`}
          onClick={() => onActionSelected(id)}
        >
          {name}
        </button>
      ))}
    </>
  );
};
