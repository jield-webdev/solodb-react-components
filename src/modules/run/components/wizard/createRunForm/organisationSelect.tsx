import { Col, Form, Row } from "react-bootstrap";

type OrganisationOption = { id: number; label: string };

type OrganisationSelectProps = {
  controlId: string;
  /** Capitalized singular entity name, e.g. "Group". */
  label: string;
  options: OrganisationOption[];
  isLoading: boolean;
  value: number | null;
  onChange: (id: number | null) => void;
  showError: boolean;
  disabled: boolean;
  helpText: string;
};

const parseSelectedId = (value: string): number | null => {
  if (value === "") {
    return null;
  }

  const id = Number(value);
  return Number.isFinite(id) ? id : null;
};

// A required select for one organisation entity (group, team or project).
export default function OrganisationSelect({
  controlId,
  label,
  options,
  isLoading,
  value,
  onChange,
  showError,
  disabled,
  helpText,
}: OrganisationSelectProps) {
  const entity = label.toLowerCase();
  const entities = `${entity}s`;

  return (
    <Form.Group as={Row} className="mb-3" controlId={controlId}>
      <Form.Label column sm={3}>
        {label} <span className="text-danger">*</span>
      </Form.Label>
      <Col sm={9}>
        <Form.Select
          value={value ?? ""}
          onChange={(event) => onChange(parseSelectedId(event.target.value))}
          required
          disabled={disabled}
          isInvalid={showError}
        >
          <option value="">{isLoading ? `Loading ${entities}...` : `— Select a ${entity}`}</option>
          {options.map((option) => (
            <option key={option.id} value={option.id}>
              {option.label}
            </option>
          ))}
        </Form.Select>
        {showError && (
          <Form.Control.Feedback type="invalid">
            {isLoading ? `${label}s are still loading.` : `— Select a ${entity}.`}
          </Form.Control.Feedback>
        )}
        <Form.Text muted>{helpText}</Form.Text>
      </Col>
    </Form.Group>
  );
}
