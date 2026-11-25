import { type Run } from "@jield/solodb-typescript-core";
import { Badge, Button, Card, Form, Spinner } from "react-bootstrap";
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
 * level. Parts can be picked as cards or, in experimental-edit mode,
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

  const splitTotal = selectedPartIds.reduce((sum, partId) => sum + selection.getPartAmount(run.id, partId), 0);

  return (
    <Card className="mb-3">
      <Card.Header className="d-flex align-items-center justify-content-between flex-wrap gap-3 py-3">
        <div>
          <h3 className="h5 mb-1">
            {run.label} — {run.name}
          </h3>
          <span className="text-body-secondary small">Choose parent parts and configure their experimental split.</span>
        </div>
        <Badge bg="primary">
          {selectedPartIds.length} selected · Total split: {splitTotal}
        </Badge>
      </Card.Header>
      <Card.Body>
        <div className="d-flex align-items-center justify-content-between flex-wrap gap-3 mb-3">
          <div>
            <h4 className="h5 mb-1">Select parts</h4>
            <p className="text-body-secondary small mb-0">
              {experimentalEdit
                ? "Set the split amount for each part, then select the parts to include."
                : "Click a part to select or deselect it. Each selected part contributes its split amount."}
            </p>
          </div>
          <div className="d-flex align-items-center gap-2">
            <Button
              variant="outline-primary"
              size="sm"
              onClick={onToggleExperimentalEdit}
              aria-pressed={experimentalEdit}
            >
              {experimentalEdit ? "Done editing split" : "Edit experimental split"}
            </Button>
            <Button
              variant="outline-secondary"
              size="sm"
              disabled={selectedPartIds.length === 0}
              onClick={() => selection.setRunPartIds(run.id, [])}
            >
              Clear selection
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
        <Form.Group controlId={`parent-description-${run.id}`} className="border-top pt-3 mt-3">
          <Form.Label>
            Description <span className="text-body-secondary small">(optional)</span>
          </Form.Label>
          <Form.Control
            as="textarea"
            rows={2}
            value={selection.descriptionsByRunId[run.id] ?? ""}
            onChange={(event) => selection.setDescription(run.id, event.target.value)}
            placeholder={`Enter a description for ${run.label}`}
          />
        </Form.Group>
      </Card.Body>
    </Card>
  );
}
