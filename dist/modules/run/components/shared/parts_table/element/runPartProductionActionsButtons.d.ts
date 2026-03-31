import { RunStepPartActionEnum, RunStepPart } from '@jield/solodb-typescript-core';
type Props = {
    runStepPart: RunStepPart;
    setRunStepPartAction: ({ runStepPart, runStepPartAction, }: {
        runStepPart: RunStepPart;
        runStepPartAction: RunStepPartActionEnum;
    }) => void;
};
declare const RunPartProductionActionsButtons: ({ runStepPart, setRunStepPartAction }: Props) => import("react/jsx-runtime").JSX.Element;
export default RunPartProductionActionsButtons;
