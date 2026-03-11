import { FileUploadEvent, irisStreamEventsInContext } from "@jield/solodb-typescript-core";
import { useEffect, useRef, useState } from "react";

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isFileUploadEvent(value: unknown): value is FileUploadEvent {
  if (!isObject(value)) {
    return false;
  }

  return (
    typeof value.uid === "string" &&
    typeof value.context === "string" &&
    typeof value.state === "string" &&
    typeof value.start === "string"
  );
}

function parseFileUploadEvents(rawData: string): FileUploadEvent {
  const parsedData: unknown = JSON.parse(rawData);

  if (!isFileUploadEvent(parsedData)) {
    throw new Error("Received SSE payload is not a valid FileUploadEvent[]");
  }

  return parsedData;
}

interface IrisStreamContextEventsOptions {
  irisEndpoint: string;
  context: string;
  onMessage: (data: FileUploadEvent) => void;
  onError: (error: Event | null) => void;
}

export function useIrisStreamContextEvents({
  irisEndpoint,
  context,
  onMessage,
  onError,
}: IrisStreamContextEventsOptions): {
  isConnected: boolean;
  close: () => void;
} {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    const setupSSE = async () => {
      if (!context) {
        return;
      }

      try {
        const baseUrl = irisEndpoint.endsWith("/") ? irisEndpoint : `${irisEndpoint}/`;

        const stream = irisStreamEventsInContext({
          context: context,
          irisServerUrl: baseUrl,
          onError: (error) => {
            setIsConnected(false);
            if (onError) onError(error);
            stream.close();
          },
          onOpen: (event: FileUploadEvent) => {
            setIsConnected(true);
          },
          onEvent: (event: FileUploadEvent) => {
            try {
              const data = parseFileUploadEvents(event);
              onMessage(data);
            } catch (err) {
              console.error("Failed to parse SSE data:", err);
              throw err;
            }
          },
        });
      } catch (err) {
        console.error("Failed to establish SSE connection:", err);
        setTimeout(setupSSE, 5000);
      }
    };

    setupSSE();

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
        setIsConnected(false);
      }
    };
  }, [irisEndpoint, context, onMessage, onError]);

  const close = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
      setIsConnected(false);
    }
  };

  return { isConnected, close };
}
