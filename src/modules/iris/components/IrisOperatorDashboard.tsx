import { FileUploadEvent } from "@jield/solodb-typescript-core";
import { FormEvent, useCallback, useMemo, useState } from "react";
import IrisOperatorEventDetails from "./IrisOperatorEventDetails";
import IrisOperatorEventList from "./IrisOperatorEventList";
import { getContentEntries } from "./irisOperatorDashboardUtils";
import { useIrisStreamContextEvents } from "../hooks/useIrisStreamContextEvents";

const IRIS_SERVER_ENDPOINT = "http://127.0.0.1:4444";

export default function IrisOperatorDashboard() {
  const [irisContext, setContextInput] = useState("lab-a");
  const [events, setEvents] = useState<FileUploadEvent[]>([]);
  const [selectedEventUid, setSelectedEventUid] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleMessage = useCallback(
    (incomingEvent: FileUploadEvent) => {
      if (irisContext === "") {
        return;
      }

      if (incomingEvent.context !== irisContext) {
        return;
      }

      setEvents((currentEvents) => [
        incomingEvent,
        ...currentEvents.filter((event) => event.uid !== incomingEvent.uid),
      ]);
      setSelectedEventUid(incomingEvent.uid);
    },
    [irisContext]
  );

  const handleError = useCallback(
    (error: Event | null) => {
      if (irisContext === "") {
        setErrorMessage("");
        return;
      }

      if (error === null) {
        setErrorMessage("");
        return;
      }

      setErrorMessage("Error trying to connect to the server, reconnecting....");
    },
    [irisContext]
  );

  const { isConnected } = useIrisStreamContextEvents({
    irisEndpoint: IRIS_SERVER_ENDPOINT,
    context: irisContext,
    onMessage: handleMessage,
    onError: handleError,
  });

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setEvents([]);
    setSelectedEventUid("");
    setErrorMessage("");
  };

  const selectedEvent = useMemo(() => {
    if (events.length === 0) {
      return null;
    }

    return events.find((event) => event.uid === selectedEventUid) ?? events[0];
  }, [events, selectedEventUid]);

  const selectedEventContent = useMemo(() => {
    if (!selectedEvent) {
      return [];
    }

    return getContentEntries(selectedEvent.content);
  }, [selectedEvent]);

  return (
    <div className="w-100">
      <div className="card shadow-sm border-0">
        <div className="card-body p-3 p-lg-4">
          <form onSubmit={handleSubmit} className="row g-2 align-items-end mb-4">
            <div className="col-lg-8">
              <label className="form-label fw-semibold" htmlFor="iris-context-input">
                Context
              </label>
              <input
                id="iris-context-input"
                className="form-control"
                type="text"
                value={irisContext}
                placeholder="lab-a"
                onChange={(event) => setContextInput(event.target.value)}
              />
            </div>
          </form>

          {errorMessage !== "" && <div className="alert alert-danger py-2 mb-4">{errorMessage}</div>}
          {!isConnected && <div className="alert alert-warning py-2 mb-4">Could not connect to the server</div>}

          {isConnected && (
            <div className="row g-3" key={`${irisContext}${events.length > 0 ? events[0].uid : ""}`}>
              <div className="col-xl-5">
                <IrisOperatorEventList
                  activeContext={irisContext}
                  events={events}
                  selectedEventUid={selectedEvent?.uid || ""}
                  onSelectEvent={setSelectedEventUid}
                />
              </div>

              <div className="col-xl-7">
                <IrisOperatorEventDetails event={selectedEvent} contentEntries={selectedEventContent} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
