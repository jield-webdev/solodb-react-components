import { type Run } from "@jield/solodb-typescript-core";
import { Button, Form, Spinner } from "react-bootstrap";
import { type ParentRunSelection } from "../../../hooks/useParentRunSelection";
import { type PartLevelGroup } from "./partGrouping";
import PartLevelFieldset from "./partLevelFieldset";

type RunPartPickerProps = {
  run: Run;
  selection: ParentRunSelection;
  partGroups: PartLevelGroup[];
  isLoadingParts: boolean;
  experimentalEdit: boolean;
  onToggleExperimentalEdit: () => void;
};

/**
 * Description and part selection for a single parent run, grouped by part
 * level. Parts can be picked as plain badges or, in experimental-edit mode,
 * with a split amount per part.
 */
export default function RunPartPicker({
  run,
  selection,
  partGroups,
  isLoadingParts,
  experimentalEdit,
  onToggleExperimentalEdit,
}: RunPartPickerProps) {
  const selectedPartIds = selection.getSelectedPartIds(run.id);

  return (
    <div>
      <div className="mb-4">
        <h3>Description</h3>
        <Form.Control
          as="textarea"
          rows={3}
          value={selection.descriptionsByRunId[run.id] ?? ""}
          onChange={(event) => selection.setDescription(run.id, event.target.value)}
          placeholder={`Enter a description for ${run.label}`}
        />
      </div>

      <div className="d-flex align-items-center justify-content-between mb-3">
        <div>
          <h3 className="mb-1">Select parts</h3>
          <Button
            variant={experimentalEdit ? "outline-primary" : "primary"}
            size="sm"
            onClick={onToggleExperimentalEdit}
            aria-pressed={experimentalEdit}
          >
            {experimentalEdit ? "Done editing split" : "Edit experimental split"}
          </Button>
          {experimentalEdit && <p className="text-secondary small mb-0 mt-1">Amounts must be 1 or higher.</p>}

          <p className="text-secondary mb-0">
            {run.label} — {run.name}
          </p>
        </div>
        <div className="d-flex align-items-center gap-2">
          {selectedPartIds.length > 0 && (
            <span className="text-secondary small">{selectedPartIds.length} selected</span>
          )}
          <Button variant="link" size="sm" className="p-0" onClick={() => selection.setRunPartIds(run.id, [])}>
            Clear
          </Button>
        </div>
      </div>

      {isLoadingParts && (
        <div className="d-flex align-items-center gap-2 text-secondary">
          <Spinner animation="border" size="sm" role="status" aria-hidden="true" />
          <span>Loading parts…</span>
        </div>
      )}

      {!isLoadingParts && partGroups.length === 0 && (
        <p className="text-secondary mb-0">This run has no parts to select.</p>
      )}

      {!isLoadingParts &&
        partGroups.map((group) => (
          <PartLevelFieldset
            key={group.level}
            runId={run.id}
            group={group}
            selection={selection}
            experimentalEdit={experimentalEdit}
          />
        ))}
    </div>
  );
}
