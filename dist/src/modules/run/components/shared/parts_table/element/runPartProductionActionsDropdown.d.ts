import { default as React } from 'react';
import { RunStepPart, RunStepPartActionEnum } from '@jield/solodb-typescript-core';
type Props = {
    runStepPart: RunStepPart;
    createRunStepPart: () => void;
    setRunStepPartAction: ({ runStepPart, runStepPartAction, }: {
        runStepPart: RunStepPart;
        runStepPartAction: RunStepPartActionEnum;
    }) => void;
};
declare const RunPartProductionActionsDropdown: ({ runStepPart, setRunStepPartAction, createRunStepPart, }: Props) => React.JSX.Element;
export default RunPartProductionActionsDropdown;
