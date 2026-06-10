import { type Run } from "@jield/solodb-typescript-core";
import { Badge, Button } from "react-bootstrap";

type SelectedRunListProps = {
  selectedRuns: Run[];
  onDeselect: (runId: number) => void;
};

export default function SelectedRunList({ selectedRuns, onDeselect }: SelectedRunListProps) {
  return (
    <div className="mb-4">
      <div className="d-flex align-items-center justify-content-between mb-2">
        <h3 className="mb-0">Selected runs</h3>
        {selectedRuns.length > 0 && (
          <Badge bg="primary" pill className="fw-normal">
            {selectedRuns.length}
          </Badge>
        )}
      </div>

      {selectedRuns.length === 0 && (
        <p className="text-secondary mb-0">Select one or more parent runs to configure their parts.</p>
      )}

      {selectedRuns.length > 0 && (
        <div className="d-flex flex-column gap-2">
          {selectedRuns.map((run) => (
            <div key={run.id} className="d-flex flex-column gap-2 bg-body-secondary rounded p-2">
              <div>
                <div className="fw-semibold">
                  {run.label} — {run.name}
                </div>
                <div className="text-secondary small">Included in creation</div>
              </div>
              <div className="d-flex align-items-center gap-2">
                <Button variant="outline-danger" size="sm" onClick={() => onDeselect(run.id)}>
                  Deselect
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
