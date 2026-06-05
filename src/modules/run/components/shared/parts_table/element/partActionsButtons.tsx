import { useState } from "react";
import { RunStepPartActionEnum } from "@jield/solodb-typescript-core";
import { ACTION_VARIANT } from "./partActionVariants";

export interface PartActionsButtonsProps {
  availableActions: { id: RunStepPartActionEnum; name: string }[];
  onActionSelected: (action: RunStepPartActionEnum) => Promise<void> | void;
}

export const PartActionsButtons = ({ availableActions, onActionSelected }: PartActionsButtonsProps) => {
  if (availableActions.length === 0) return null;
  const [loadingActionId, setLoadingActionId] = useState<RunStepPartActionEnum | null>(null);

  const handleAction = async (action: RunStepPartActionEnum) => {
    if (loadingActionId !== null) return;
    setLoadingActionId(action);
    try {
      await onActionSelected(action);
    } finally {
      setLoadingActionId(null);
    }
  };

  return (
    <>
      {availableActions.map(({ id, name }) => (
        <button
          key={id}
          type="button"
          className={`btn btn-sm ${ACTION_VARIANT[id]}`}
          onClick={() => void handleAction(id)}
          disabled={loadingActionId !== null}
        >
          {loadingActionId === id && <span className="spinner-border spinner-border-sm me-1"></span>}
          {name}
        </button>
      ))}
    </>
  );
};
