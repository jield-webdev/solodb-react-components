import { ReactNode } from 'react';
export interface PartSelectionControlsProps {
    onSelectAll: () => void;
    onSelectNone: () => void;
    hasSelectedParts: boolean;
    actionsDropdown?: ReactNode;
}
/**
 * Control buttons for part selection (All/None) with optional actions dropdown
 *
 * Renders a button group for selecting/deselecting all parts,
 * and conditionally displays an actions dropdown when parts are selected.
 */
export declare const PartSelectionControls: ({ onSelectAll, onSelectNone, hasSelectedParts, actionsDropdown, }: PartSelectionControlsProps) => import("react/jsx-runtime").JSX.Element;
