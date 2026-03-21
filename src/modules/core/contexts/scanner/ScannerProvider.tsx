import { ReactElement, useEffect, useState } from "react";
import { ScannerContext } from "./ScannerContext";
import { makeKeySequenceListener } from "@jield/solodb-react-components/utils/keySequenceListener";

export const ScannerProvider = ({ children }: { children: ReactElement }) => {
  const [readingKeys, setReadingKeys] = useState<string>("");
  const [readedKeys, setReadedKeys] = useState<string>("");

  useEffect(() => {
    const listener = makeKeySequenceListener("*", setReadedKeys, setReadingKeys, { requireEndCharacter: true });

    document.addEventListener("keyup", listener);

    return () => {
      document.removeEventListener("keyup", listener);
    };
  }, []);

  return (
    <ScannerContext.Provider
      value={{
        readedKeys,
        readingKeys,
      }}
    >
      {children}
    </ScannerContext.Provider>
  );
};
