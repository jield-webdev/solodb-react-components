import { ReactNode } from "react";

export interface PartSelectionControlsProps {
  onSelectAll: () => void;
  onSelectNone: () => void;
  hasSelectedParts: boolean;
  actionsDropdown?: ReactNode;
  traySelections?: {
    id: number;
    label: string;
    partIds: number[];
    allSelected: boolean;
  }[];
  onToggleTray?: (partIds: number[], nextSelected: boolean) => void;
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
  traySelections,
  onToggleTray,
}: PartSelectionControlsProps) => {
  const hasTrays = (traySelections ?? []).length > 0;

  return (
    <div className="d-flex flex-wrap gap-3">
      <div className="btn-group btn-group-sm" role="group" aria-label="Part selection controls">
        <button className="part-check-all btn btn-outline-secondary" onClick={onSelectAll}>
          All
        </button>
        <button className="part-check-none btn btn-outline-secondary" onClick={onSelectNone}>
          None
        </button>
      </div>
      {hasTrays && (
        <div className="btn-group btn-group-sm" role="group" aria-label="Tray selection controls">
          {traySelections?.map((tray) => {
            const isSelected = tray.allSelected;
            return (
              <button
                key={tray.id}
                type="button"
                className={`btn ${isSelected ? "btn-secondary" : "btn-outline-secondary"}`}
                aria-pressed={isSelected}
                onClick={() => onToggleTray?.(tray.partIds, !isSelected)}
              >
                {tray.label}
              </button>
            );
          })}
        </div>
      )}
      {hasSelectedParts && actionsDropdown}
    </div>
  );
};
