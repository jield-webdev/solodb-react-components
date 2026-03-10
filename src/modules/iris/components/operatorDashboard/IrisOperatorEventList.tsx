import { FileUploadEvent } from "@jield/solodb-typescript-core";
import { formatDateTime } from "@jield/solodb-react-components/utils/datetime";
import { getStateBadgeClass } from "../irisOperatorDashboardUtils";

interface IrisOperatorEventListProps {
  activeContext: string;
  events: FileUploadEvent[];
  selectedEventUid: string;
  onSelectEvent: (uid: string) => void;
}

export default function IrisOperatorEventList({
  activeContext,
  events,
  selectedEventUid,
  onSelectEvent,
}: IrisOperatorEventListProps) {
  return (
    <div className="border rounded overflow-hidden h-100">
      <div className="border-bottom px-3 py-2">
        <div className="fw-semibold">Incoming upload events</div>
        <div className="small text-secondary">Latest messages for the selected context</div>
      </div>

      <div className="list-group list-group-flush">
        {events.map((item) => {
          const isSelected = selectedEventUid === item.uid;

          return (
            <button
              type="button"
              className={`list-group-item list-group-item-action text-start ${isSelected ? "active" : ""}`}
              key={item.uid}
              onClick={() => onSelectEvent(item.uid)}
            >
              <div className="d-flex justify-content-between align-items-start gap-2 mb-2">
                <code className={isSelected ? "text-white" : ""}>{item.uid}</code>
                <span className={`badge ${getStateBadgeClass(item.state)}`}>{item.state}</span>
              </div>
              <div className={`small ${isSelected ? "text-white-50" : "text-secondary"}`}>
                <div>Context: {item.context}</div>
                <div>Started: {formatDateTime(item.start)}</div>
              </div>
            </button>
          );
        })}

        {activeContext !== "" && events.length === 0 && (
          <div className="list-group-item text-secondary">Listening for new events...</div>
        )}

        {activeContext === "" && (
          <div className="list-group-item text-secondary">Select a context to start the live stream.</div>
        )}
      </div>
    </div>
  );
}
