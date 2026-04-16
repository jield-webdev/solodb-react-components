import { ReactElement, startTransition, useEffect, useRef, useState } from "react";
import { makeKeyListener } from "@jield/solodb-react-components/utils/keySequenceListener";
import parseScannerForRun, { ScannedKeysType } from "@jield/solodb-react-components/modules/core/utils/parseScannerType";
import { ScannerContext } from "../contexts/scannerContext";

export const ScannerProvider = ({ children }: { children: ReactElement }) => {
  const [lastlyReadedKeys, setLastlyReadedKeys] = useState<string>("");

  const readCompletedCallbacksRef = useRef<Map<ScannedKeysType, Map<string, (keys: string) => void>>>(new Map());
  const readingCallbacksRef = useRef<Map<string, (keys: string) => void>>(new Map());

  const onReadingKeys = (keys: string) => {
    startTransition(() => {
      readingCallbacksRef.current.forEach((fun) => fun(keys));
    });
  };

  const onReadKeys = (keys: string) => {
    setLastlyReadedKeys(keys);

    const scannedKeysType = parseScannerForRun(keys);

    startTransition(() => {
      readCompletedCallbacksRef.current.get(scannedKeysType)?.forEach((fun) => fun(keys));
    });
  };

  useEffect(() => {
    const listener = makeKeyListener(onReadKeys, onReadingKeys);

    document.addEventListener("keyup", listener);

    return () => {
      document.removeEventListener("keyup", listener);
    };
  }, [onReadKeys, onReadingKeys]);

  const addCallbackFn = (type: ScannedKeysType, id: string, fun: (readedKeys: string) => void) => {
    if (!readCompletedCallbacksRef.current.has(type)) {
      readCompletedCallbacksRef.current.set(type, new Map());
    }
    readCompletedCallbacksRef.current.get(type)!.set(id, fun);
  };

  const removeCallbackFn = (type: ScannedKeysType, id: string) => {
    readCompletedCallbacksRef.current.get(type)?.delete(id);
  };

  const addReadingCallbackFn = (id: string, fun: (readingKeys: string) => void) => {
    readingCallbacksRef.current.set(id, fun);
  };

  const removeReadingCallbackFn = (id: string) => {
    readingCallbacksRef.current.delete(id);
  };

  return (
    <ScannerContext.Provider
      value={{
        lastlyReadedKeys,
        addCallbackFn,
        removeCallbackFn,
        addReadingCallbackFn,
        removeReadingCallbackFn,
      }}
    >
      {children}
    </ScannerContext.Provider>
  );
};
