import { RunStepPartActionEnum } from '@jield/solodb-typescript-core';
export interface PartActionsDropdownProps {
    availableActions: Set<RunStepPartActionEnum>;
    onActionSelected: (action: RunStepPartActionEnum) => void;
    showInitAction?: boolean;
    onInitSelected?: () => void;
}
/**
 * Dropdown component for bulk part actions
 *
 * Renders a dropdown menu with available actions (Start, Finish, Failed, Rework)
 * and optionally an Init action for production runs.
 */
export declare const PartActionsDropdown: ({ availableActions, onActionSelected, showInitAction, onInitSelected, }: PartActionsDropdownProps) => import("react/jsx-runtime").JSX.Element | null;
