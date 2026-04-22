import { RunStepPartActionEnum } from '@jield/solodb-typescript-core';
export interface PartActionsButtonsProps {
    availableActions: {
        id: RunStepPartActionEnum;
        name: string;
    }[];
    onActionSelected: (action: RunStepPartActionEnum) => Promise<void> | void;
}
export declare const PartActionsButtons: ({ availableActions, onActionSelected }: PartActionsButtonsProps) => import("react/jsx-runtime").JSX.Element | null;
