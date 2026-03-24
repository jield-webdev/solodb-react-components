import { ReactElement, useCallback, useEffect, useRef, useState } from "react";
import { ScannerContext } from "./ScannerContext";
import { makeKeySequenceListener } from "@jield/solodb-react-components/utils/keySequenceListener";

export const ScannerProvider = ({ children }: { children: ReactElement }) => {
  const [readingKeys, setReadingKeys] = useState<string>("");
  const [readedKeys, setReadedKeys] = useState<string>("");

  const callbacksRef = useRef<Map<string, (keys: string) => void>>(new Map());

  const onReadKeys = useCallback((keys: string) => {
    setReadedKeys(keys);
    callbacksRef.current.forEach((fun) => fun(keys));
  }, []);

  useEffect(() => {
    const listener = makeKeySequenceListener("*", onReadKeys, setReadingKeys, { requireEndCharacter: true });

    document.addEventListener("keyup", listener);

    return () => {
      document.removeEventListener("keyup", listener);
    };
  }, [onReadKeys]);

  const addCallbackFn = useCallback((id: string, fun: (readedKeys: string) => void) => {
    callbacksRef.current.set(id, fun);
  }, []);

  const removeCallbackFn = useCallback((id: string) => {
    callbacksRef.current.delete(id);
  }, []);

  return (
    <ScannerContext.Provider
      value={{
        readKeys: readedKeys,
        readingKeys,
        addCallbackFn,
        removeCallbackFn,
      }}
    >
      {children}
    </ScannerContext.Provider>
  );
};
