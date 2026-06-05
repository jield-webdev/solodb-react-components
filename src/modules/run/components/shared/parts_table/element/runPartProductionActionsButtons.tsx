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
    <>
      {runStepPart.available_actions.map(({ id, name }) => (
        <button
          key={id}
          type="button"
          className={`btn btn-sm me-2 ${ACTION_VARIANT[id]}`}
          onClick={() => setRunStepPartAction({ runStepPart, runStepPartAction: id })}
        >
          {name}
        </button>
      ))}
    </>
  );
};

export default RunPartProductionActionsButtons;
