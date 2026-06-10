import { type Run } from "@jield/solodb-typescript-core";
import { type ReactNode } from "react";
import { Badge } from "react-bootstrap";
import { type SelectedSubstrate } from "../substrateSelect";

type SelectionOverviewProps = {
  selectedRuns: Run[];
  selectedSubstrates: SelectedSubstrate[];
  partIdsByRunId: Record<number, number[]>;
};

function OverviewBlock({
  title,
  isEmpty,
  emptyText,
  children,
}: {
  title: string;
  isEmpty: boolean;
  emptyText: string;
  children: ReactNode;
}) {
  return (
    <div>
      <div className="text-secondary small text-uppercase fw-semibold mb-2">
        {title} <span className="text-body-tertiary">(selected previously)</span>
      </div>
      {isEmpty ? (
        <p className="text-secondary fst-italic mb-0">{emptyText}</p>
      ) : (
        <div className="d-flex flex-column gap-2">{children}</div>
      )}
    </div>
  );
}

// Read-only recap of the parent runs and substrates picked in earlier wizard pages.
export default function SelectionOverview({
  selectedRuns,
  selectedSubstrates,
  partIdsByRunId,
}: SelectionOverviewProps) {
  return (
    <>
      <OverviewBlock
        title="Parent runs & parts"
        isEmpty={selectedRuns.length === 0}
        emptyText="No parent runs selected."
      >
        {selectedRuns.map((run) => {
          const selectedPartCount = partIdsByRunId[run.id]?.length ?? 0;
          return (
            <div
              key={run.id}
              className="d-flex align-items-center justify-content-between gap-3 bg-body-secondary border-0 rounded p-2"
            >
              <div className="fw-semibold">
                {run.label} — {run.name}
              </div>
              {selectedPartCount > 0 ? (
                <Badge bg="secondary" pill className="fw-normal">
                  {selectedPartCount} {selectedPartCount === 1 ? "part" : "parts"}
                </Badge>
              ) : (
                <span className="text-secondary fst-italic small">No parts selected</span>
              )}
            </div>
          );
        })}
      </OverviewBlock>

      <OverviewBlock title="Substrates" isEmpty={selectedSubstrates.length === 0} emptyText="No substrates selected.">
        {selectedSubstrates.map(({ substrate, amount }) => (
          <div
            key={substrate.id}
            className="d-flex align-items-center justify-content-between gap-3 bg-body-secondary rounded p-2"
          >
            <div className="fw-semibold">
              {substrate.label} — {substrate.short_label}
            </div>
            <Badge bg="secondary" pill className="fw-normal">
              Amount: {amount}
            </Badge>
          </div>
        ))}
      </OverviewBlock>
    </>
  );
}
