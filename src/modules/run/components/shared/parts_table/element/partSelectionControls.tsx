import { ReactNode } from "react";

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
export const PartSelectionControls = ({
  onSelectAll,
  onSelectNone,
  hasSelectedParts,
  actionsDropdown,
}: PartSelectionControlsProps) => {
  return (
    <div className="d-flex gap-3">
      <div className="btn-group btn-group-sm" role="group">
        <button className="part-check-all btn btn-outline-secondary" onClick={onSelectAll}>
          All
        </button>
        <button className="part-check-none btn btn-outline-secondary" onClick={onSelectNone}>
          None
        </button>
      </div>
      {hasSelectedParts && actionsDropdown}
    </div>
  );
};
