import { RunStepPart, RunStepPartActionEnum } from "@jield/solodb-typescript-core";
import { ACTION_VARIANT } from "./partActionVariants";

type Props = {
  runStepPart: RunStepPart;
  setRunStepPartAction: ({
    runStepPart,
    runStepPartAction,
  }: {
    runStepPart: RunStepPart;
    runStepPartAction: RunStepPartActionEnum;
  }) => void;
};

const RunPartProductionActionsButtons = ({ runStepPart, setRunStepPartAction }: Props) => {
  if (runStepPart.available_actions.length === 0) return null;

  return (
    <div className="btn-group btn-group-sm" role="group" aria-label="Part actions">
      {runStepPart.available_actions.map(({ id, name }) => (
        <button
          key={id}
          type="button"
          className={`btn ${ACTION_VARIANT[id]}`}
          onClick={() => setRunStepPartAction({ runStepPart, runStepPartAction: id })}
        >
          {name}
        </button>
      ))}
    </div>
  );
};

export default RunPartProductionActionsButtons;
