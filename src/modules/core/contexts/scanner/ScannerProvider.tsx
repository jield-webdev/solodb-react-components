import { ReactElement, startTransition, useCallback, useEffect, useRef, useState } from "react";
import { ScannerContext } from "./ScannerContext";
import { makeKeySequenceListener } from "@jield/solodb-react-components/utils/keySequenceListener";

export const ScannerProvider = ({ children }: { children: ReactElement }) => {
  const [lastlyReadedKeys, setLastlyReadedKeys] = useState<string>("");

  const readCompletedCallbacksRef = useRef<Map<string, (keys: string) => void>>(new Map());
  const readingCallbacksRef = useRef<Map<string, (keys: string) => void>>(new Map());

  const onReadingKeys = (keys: string) => {
    startTransition(() => {
      readingCallbacksRef.current.forEach((fun) => fun(keys));
    });
  };

  const onReadKeys = (keys: string) => {
    setLastlyReadedKeys(keys);
    startTransition(() => {
      readCompletedCallbacksRef.current.forEach((fun) => fun(keys));
    });
  };

  useEffect(() => {
    const listener = makeKeySequenceListener("*", onReadKeys, onReadingKeys, { requireEndCharacter: true });

    document.addEventListener("keyup", listener);

    return () => {
      document.removeEventListener("keyup", listener);
    };
  }, [onReadKeys, onReadingKeys]);

  const addCallbackFn = (id: string, fun: (readedKeys: string) => void) => {
    readCompletedCallbacksRef.current.set(id, fun);
  };

  const removeCallbackFn = (id: string) => {
    readCompletedCallbacksRef.current.delete(id);
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
