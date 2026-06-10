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
      <label htmlFor={selectedInputId} className="flex-grow-1 mb-0" style={{ cursor: "pointer" }}>
        {partLabel}
      </label>
      <Form.Check
        id={selectedInputId}
        type="checkbox"
        checked={selected}
        onChange={() => selection.togglePart(runId, part.id)}
        aria-label={`Select ${partLabel}`}
        className="ms-sm-auto"
      />
    </div>
  );
}

function PartToggleBadge({ runId, part, selection }: { runId: number; part: RunPart; selection: ParentRunSelection }) {
  const selected = selection.isPartSelected(runId, part.id);

  return (
    <Badge
      as="button"
      type="button"
      bg={selected ? "primary" : "dark"}
      onClick={() => selection.togglePart(runId, part.id)}
      aria-pressed={selected}
      title={part.label}
      className={`border-0 fs-6 fw-normal px-3 py-2${selected ? " step-part-selected" : ""}`}
      style={{ cursor: "pointer" }}
    >
      {getPartLabel(part)}
    </Badge>
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
    <fieldset className="mb-4 border-0 p-0">
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
        <div className="d-flex flex-wrap gap-2">
          {group.parts.map((part) => (
            <PartToggleBadge key={part.id} runId={runId} part={part} selection={selection} />
          ))}
        </div>
      )}
    </fieldset>
  );
}
