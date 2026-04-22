import { RunStepPartActionEnum } from '@jield/solodb-typescript-core';
export interface PartActionsDropdownProps {
    availableActions: {
        id: RunStepPartActionEnum;
        name: string;
    }[];
    onActionSelected: (action: RunStepPartActionEnum) => Promise<void> | void;
}
/**
 * Dropdown component for bulk part actions.
 *
 * Renders a dropdown menu driven by the server-provided `available_actions` array.
 */
export declare const PartActionsDropdown: ({ availableActions, onActionSelected }: PartActionsDropdownProps) => import("react/jsx-runtime").JSX.Element | null;
