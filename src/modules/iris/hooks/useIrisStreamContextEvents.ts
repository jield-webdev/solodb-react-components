import { FileUploadEvent, irisStreamEventsInContext } from "@jield/solodb-typescript-core";
import { useEffect, useRef, useState } from "react";

interface IrisStreamContextEventsOptions {
  irisEndpoint: string;
  context: string;
  onMessage: (data: FileUploadEvent) => void;
  onError: (error: Event | null) => void;
}

type IrisStreamHandle = ReturnType<typeof irisStreamEventsInContext>;

export function useIrisStreamContextEvents({
  irisEndpoint,
  context,
  onMessage,
  onError,
}: IrisStreamContextEventsOptions): {
  isConnected: boolean;
  close: () => void;
} {
  const streamRef = useRef<IrisStreamHandle | null>(null);
  const reconnectTimerRef = useRef<number | null>(null);
  const shouldReconnectRef = useRef(true);
  const retryCountRef = useRef(0);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!context) return;

    shouldReconnectRef.current = true;

    const clearReconnectTimer = () => {
      if (reconnectTimerRef.current !== null) {
        window.clearTimeout(reconnectTimerRef.current);
        reconnectTimerRef.current = null;
      }
    };

    const connect = () => {
      clearReconnectTimer();
      const stream = irisStreamEventsInContext({
        context,
        irisServerUrl: irisEndpoint.endsWith("/") ? irisEndpoint : `${irisEndpoint}/`,
        onOpen: () => {
          retryCountRef.current = 0;
          setIsConnected(true);
        },
        onEvent: (event: FileUploadEvent) => {
          onMessage(event);
        },
        onError: (error) => {
          setIsConnected(false);
          onError(error);
          stream.close();
          if (!shouldReconnectRef.current) return;
          const delay = Math.min(1000 * 2 ** retryCountRef.current, 30000);
          retryCountRef.current += 1;
          reconnectTimerRef.current = window.setTimeout(() => {
            connect();
          }, delay);
        },
      });
      streamRef.current = stream;
      stream.start();
    };

    connect();

    return () => {
      shouldReconnectRef.current = false;
      clearReconnectTimer();
      streamRef.current?.close();
      streamRef.current = null;
      setIsConnected(false);
    };
  }, [irisEndpoint, context, onMessage, onError]);
  const close = () => {
    shouldReconnectRef.current = false;
    if (reconnectTimerRef.current !== null) {
      window.clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }
    streamRef.current?.close();
    streamRef.current = null;
    setIsConnected(false);
  };

  return { isConnected, close };
}
