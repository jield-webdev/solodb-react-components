import { RunStepPartActionEnum, RunStepPart } from '@jield/solodb-typescript-core';
type Props = {
    runStepPart: RunStepPart;
    createRunStepPart: () => void;
    setRunStepPartAction: ({ runStepPart, runStepPartAction, }: {
        runStepPart: RunStepPart;
        runStepPartAction: RunStepPartActionEnum;
    }) => void;
};
declare const RunPartProductionActionsDropdown: ({ runStepPart, setRunStepPartAction, createRunStepPart }: Props) => import("react/jsx-runtime").JSX.Element;
export default RunPartProductionActionsDropdown;
