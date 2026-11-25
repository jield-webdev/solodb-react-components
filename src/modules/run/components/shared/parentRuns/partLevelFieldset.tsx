import { type RunPart } from "@jield/solodb-typescript-core";
import { Badge, Button, Form } from "react-bootstrap";
import { type ParentRunSelection } from "../../../hooks/useParentRunSelection";
import { getPartLabel, type PartLevelGroup } from "./partGrouping";

type PartLevelFieldsetProps = {
  runId: number;
  group: PartLevelGroup;
  selection: ParentRunSelection;
  experimentalEdit: boolean;
};

function PartSplitRow({ runId, part, selection }: { runId: number; part: RunPart; selection: ParentRunSelection }) {
  const selected = selection.isPartSelected(runId, part.id);
  const partLabel = getPartLabel(part);
  const amountInputId = `part-amount-${runId}-${part.id}`;
  const selectedInputId = `part-selected-${runId}-${part.id}`;

  return (
    <div
      className={`list-group-item d-flex align-items-center gap-3 flex-wrap${
        selected ? " border-primary border-top" : ""
      }`}
    >
      <label htmlFor={selectedInputId} className="flex-grow-1 mb-0 fw-semibold" style={{ cursor: "pointer" }}>
        {partLabel}
      </label>
      <Form.Check
        id={selectedInputId}
        type="checkbox"
        checked={selected}
        onChange={() => selection.togglePart(runId, part.id)}
        aria-label={`Select ${partLabel}`}
        className="order-first"
      />
      <div className="d-flex align-items-center gap-2">
        <Form.Label htmlFor={amountInputId} className="small text-secondary mb-0">
          Split
        </Form.Label>
        <Form.Control
          id={amountInputId}
          type="number"
          size="sm"
          min={1}
          step="any"
          inputMode="decimal"
          value={selection.getPartAmount(runId, part.id)}
          onChange={(event) => selection.setPartAmount(runId, part.id, Number(event.target.value))}
          aria-label={`Experimental split amount for ${partLabel}`}
          style={{ maxWidth: "7rem" }}
        />
      </div>
    </div>
  );
}

function PartToggleCard({ runId, part, selection }: { runId: number; part: RunPart; selection: ParentRunSelection }) {
  const selected = selection.isPartSelected(runId, part.id);

  return (
    <Button
      type="button"
      variant={selected ? "primary" : "outline-secondary"}
      onClick={() => selection.togglePart(runId, part.id)}
      aria-pressed={selected}
      aria-label={`Select ${getPartLabel(part)}`}
      className="d-flex align-items-center justify-content-between gap-3 text-start p-3"
    >
      <span>
        <span className="d-block fw-semibold">{getPartLabel(part)}</span>
        <span className="d-block small">Split: {selection.getPartAmount(runId, part.id)}</span>
      </span>
      <span className="small">{selected ? "✓ Selected" : "Select"}</span>
    </Button>
  );
}

export default function PartLevelFieldset({ runId, group, selection, experimentalEdit }: PartLevelFieldsetProps) {
  const allSelected = group.parts.length > 0 && group.parts.every((part) => selection.isPartSelected(runId, part.id));

  const toggleLevel = () => {
    selection.setPartsSelected(
      runId,
      group.parts.map((part) => part.id),
      !allSelected
    );
  };

  return (
    <fieldset className="mb-3 border rounded p-3">
      <legend className="d-flex align-items-center gap-2 fs-6 fw-semibold mb-2">
        <span>Level {group.level}</span>
        <Badge bg="secondary" pill className="fw-normal">
          {group.parts.length}
        </Badge>
        <Button variant="link" size="sm" className="p-0 ms-1" onClick={toggleLevel}>
          {allSelected ? "Deselect all" : "Select all"}
        </Button>
      </legend>

      {experimentalEdit ? (
        <div className="list-group">
          {group.parts.map((part) => (
            <PartSplitRow key={part.id} runId={runId} part={part} selection={selection} />
          ))}
        </div>
      ) : (
        <div
          className="d-grid gap-2"
          style={{
            gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 13rem), 1fr))",
            gridAutoRows: "1fr",
          }}
        >
          {group.parts.map((part) => (
            <PartToggleCard key={part.id} runId={runId} part={part} selection={selection} />
          ))}
        </div>
      )}
    </fieldset>
  );
}
