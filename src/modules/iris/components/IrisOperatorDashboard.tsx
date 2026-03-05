import { FormEvent, useEffect, useMemo, useState } from "react";

const IRIS_SERVER_FQDN = "iris.example.local";

type IrisFileUploadState =
  | "started"
  | "uploading"
  | "awaiting_approval"
  | "syncing"
  | "rejected"
  | "error"
  | "completed";

type FileUploadEvent = {
  uid: string;
  context: string;
  state: IrisFileUploadState | string;
  start: string;
  completedState?: string;
  completionMesage?: string;
  TTL?: number;
  autoApprove?: boolean;
};

type ConnectionState = "idle" | "connecting" | "connected" | "error";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function parseFileUploadEvent(value: unknown): FileUploadEvent | null {
  if (!isRecord(value)) {
    return null;
  }

  const uid = value.uid;
  const context = value.context;
  const state = value.state;
  const start = value.start;

  if (
    typeof uid !== "string" ||
    typeof context !== "string" ||
    typeof state !== "string" ||
    typeof start !== "string"
  ) {
    return null;
  }

  return {
    uid,
    context,
    state,
    start,
    completedState: typeof value.completedState === "string" ? value.completedState : undefined,
    completionMesage: typeof value.completionMesage === "string" ? value.completionMesage : undefined,
    TTL: typeof value.TTL === "number" ? value.TTL : undefined,
    autoApprove: typeof value.autoApprove === "boolean" ? value.autoApprove : undefined,
  };
}

function getStateBadgeClass(state: string) {
  switch (state) {
    case "completed":
      return "bg-success";
    case "error":
    case "rejected":
      return "bg-danger";
    case "awaiting_approval":
      return "bg-warning text-dark";
    case "syncing":
    case "uploading":
      return "bg-info text-dark";
    default:
      return "bg-secondary";
  }
}

function formatDateTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleString();
}

export default function IrisOperatorDashboard() {
  const [contextInput, setContextInput] = useState("lab-a");
  const [activeContext, setActiveContext] = useState("");
  const [eventsByUid, setEventsByUid] = useState<Record<string, FileUploadEvent>>({});
  const [connectionState, setConnectionState] = useState<ConnectionState>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (activeContext.trim() === "") {
      return;
    }

    const streamUrl = `https://${IRIS_SERVER_FQDN}/v1/${encodeURIComponent(activeContext)}/events`;
    const eventSource = new EventSource(streamUrl);

    setConnectionState("connecting");
    setErrorMessage("");
    setEventsByUid({});

    eventSource.onopen = () => {
      setConnectionState("connected");
    };

    eventSource.onmessage = (event) => {
      let payload: unknown;
      try {
        payload = JSON.parse(event.data);
      } catch {
        setErrorMessage("Received a malformed event payload.");
        return;
      }

      const uploadEvent = parseFileUploadEvent(payload);
      if (!uploadEvent) {
        setErrorMessage("Received an event with an unexpected structure.");
        return;
      }

      setEventsByUid((previousEvents) => ({
        ...previousEvents,
        [uploadEvent.uid]: uploadEvent,
      }));
    };

    eventSource.onerror = () => {
      setConnectionState("error");
      setErrorMessage("Unable to receive updates from the event stream.");
    };

    return () => {
      eventSource.close();
    };
  }, [activeContext]);

  const events = useMemo(() => {
    return Object.values(eventsByUid).sort((left, right) => {
      return new Date(right.start).getTime() - new Date(left.start).getTime();
    });
  }, [eventsByUid]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setActiveContext(contextInput.trim());
  };

  return (
    <div className="container py-3">
      <h2 className="mb-3">Iris Operator Dashboard</h2>

      <form onSubmit={handleSubmit} className="row g-2 align-items-end mb-3">
        <div className="col-md-8">
          <label className="form-label" htmlFor="iris-context-input">
            Context
          </label>
          <input
            id="iris-context-input"
            className="form-control"
            type="text"
            value={contextInput}
            placeholder="lab-a"
            onChange={(e) => setContextInput(e.target.value)}
          />
        </div>
        <div className="col-md-4 d-grid">
          <button className="btn btn-primary" type="submit">
            Listen
          </button>
        </div>
      </form>

      <div className="mb-3">
        <div>
          <strong>Server:</strong> <code>{IRIS_SERVER_FQDN}</code>
        </div>
        <div>
          <strong>Context:</strong> <code>{activeContext || "-"}</code>
        </div>
        <div>
          <strong>Connection:</strong> {connectionState}
        </div>
      </div>

      {errorMessage !== "" && <div className="alert alert-warning py-2">{errorMessage}</div>}

      <div className="card">
        <div className="card-header">Incoming Upload Events</div>
        <ul className="list-group list-group-flush">
          {events.map((item) => (
            <li className="list-group-item" key={item.uid}>
              <div className="d-flex justify-content-between align-items-center gap-2">
                <code>{item.uid}</code>
                <span className={`badge ${getStateBadgeClass(item.state)}`}>{item.state}</span>
              </div>
              <div className="small text-muted mt-1">Context: {item.context}</div>
              <div className="small text-muted">Started: {formatDateTime(item.start)}</div>
            </li>
          ))}

          {activeContext !== "" && events.length === 0 && (
            <li className="list-group-item text-muted">Listening for new events...</li>
          )}

          {activeContext === "" && (
            <li className="list-group-item text-muted">Select a context and start listening.</li>
          )}
        </ul>
      </div>
    </div>
  );
}
