import { FileUploadEvent } from "@jield/solodb-typescript-core";
import { formatDateTime } from "@jield/solodb-react-components/utils/datetime";
import { ContentEntry, getStateBadgeClass } from "./irisOperatorDashboardUtils";

interface IrisOperatorEventDetailsProps {
  event: FileUploadEvent | null;
  contentEntries: ContentEntry[];
}

export default function IrisOperatorEventDetails({ event, contentEntries }: IrisOperatorEventDetailsProps) {
  return (
    <div className="border rounded h-100">
      <div className="border-bottom px-3 py-2">
        <div className="fw-semibold">Event details</div>
        <div className="small text-secondary">Inspect the current state and attached payload files</div>
      </div>

      {!event && <div className="p-4 text-secondary">Choose an event to inspect its details.</div>}

      {event && (
        <div className="p-3 p-lg-4">
          <div className="d-flex flex-column flex-md-row justify-content-between gap-3 mb-4">
            <div>
              <div className="small text-secondary text-uppercase fw-semibold mb-1">Event id</div>
              <code className="text-break">{event.uid}</code>
            </div>
            <div className="d-flex align-items-start">
              <span className={`badge ${getStateBadgeClass(event.state)}`}>{event.state}</span>
            </div>
          </div>

          <div className="row g-3 mb-4">
            <div className="col-md-6">
              <div className="rounded border p-3 h-100">
                <div className="small text-secondary text-uppercase fw-semibold mb-1">Context</div>
                <div className="fw-semibold text-break">{event.context}</div>
              </div>
            </div>
            <div className="col-md-6">
              <div className="rounded border p-3 h-100">
                <div className="small text-secondary text-uppercase fw-semibold mb-1">Started</div>
                <div className="fw-semibold">{formatDateTime(event.start)}</div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="rounded border p-3 h-100">
                <div className="small text-secondary text-uppercase fw-semibold mb-1">Completed state</div>
                <div className="fw-semibold text-break">{event.completedState || "-"}</div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="rounded border p-3 h-100">
                <div className="small text-secondary text-uppercase fw-semibold mb-1">TTL</div>
                <div className="fw-semibold">{event.TTL}</div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="rounded border p-3 h-100">
                <div className="small text-secondary text-uppercase fw-semibold mb-1">Auto approve</div>
                <div className="fw-semibold">{event.autoApprove ? "Enabled" : "Disabled"}</div>
              </div>
            </div>
          </div>

          <div>
            <div className="d-flex justify-content-between align-items-center mb-2 gap-2">
              <div>
                <h3 className="h6 mb-0">Attached files</h3>
                <div className="small text-secondary">{contentEntries.length} file entries available</div>
              </div>
            </div>

            {contentEntries.length === 0 && (
              <div className="rounded border p-3 text-secondary">This event does not include attached files.</div>
            )}

            {contentEntries.length > 0 && (
              <div className="vstack gap-3">
                {contentEntries.map(([fileName, fileContent]) => (
                  <div className="rounded border overflow-hidden" key={fileName}>
                    <div className="px-3 py-2 border-bottom d-flex justify-content-between align-items-center gap-2">
                      <code className="text-break">{fileName}</code>
                      <span className="badge border">attached</span>
                    </div>
                    <pre className="m-0 p-3 bg-body-tertiary" style={{ maxHeight: 220, overflow: "auto" }}>
                      <code>{fileContent}</code>
                    </pre>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
