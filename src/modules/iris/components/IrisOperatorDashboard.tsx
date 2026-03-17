import { FileUploadEvent, irisListContextEvents } from "@jield/solodb-typescript-core";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import IrisOperatorEventDetails from "./operatorDashboard/IrisOperatorEventDetails";
import IrisOperatorEventList from "./operatorDashboard/IrisOperatorEventList";
import { getContentEntries } from "./irisOperatorDashboardUtils";
import { useIrisStreamContextEvents } from "../hooks/useIrisStreamContextEvents";
import { getIrisServerUrl } from "../../core/config/runtimeConfig";

export default function IrisOperatorDashboard() {
  const [irisInputContext, setIrisInputContext] = useState("");
  const [irisContext, setIrisContext] = useState("");
  const [events, setEvents] = useState<FileUploadEvent[]>([]);
  const [selectedEventUid, setSelectedEventUid] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const irisServerUrl = getIrisServerUrl();

  useEffect(() => {
    if (!irisContext) {
      return;
    }
    irisListContextEvents({ irisServerUrl: irisServerUrl, context: irisContext }).then((response) => {
      // TO DO: merge with current events in case a new event hapens before the data is fetched
      setEvents(response);
    });
  }, [irisContext]);

  const handleMessage = useCallback(
    (incomingEvent: FileUploadEvent) => {
      if (irisContext === "") {
        return;
      }

      if (incomingEvent.context !== irisContext) {
        return;
      }

      setErrorMessage("");

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
    irisEndpoint: irisServerUrl,
    context: irisContext,
    onMessage: handleMessage,
    onError: handleError,
  });

  const handleSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setIrisContext(irisInputContext);
      setEvents([]);
      setSelectedEventUid("");
      setErrorMessage("");
    },
    [irisInputContext]
  );

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
                value={irisInputContext}
                placeholder="lab-a"
                onChange={(event) => setIrisInputContext(event.target.value)}
              />
            </div>
            <div className="col-lg-4 col-xl-2">
              <button className="btn btn-primary w-100" type="submit" disabled={irisInputContext.trim() === ""}>
                Load context
              </button>
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
                <IrisOperatorEventDetails
                  key={selectedEvent?.uid || ""}
                  event={selectedEvent}
                  contentEntries={selectedEventContent}
                  irisEndpoint={irisServerUrl}
                  onEventUpdated={handleMessage}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
