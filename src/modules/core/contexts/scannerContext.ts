import { createContext, useContext } from "react";
import { ScannedKeysType } from "@jield/solodb-react-components/modules/core/utils/parseScannerType";

export interface ScannerContext {
  lastlyReadedKeys: string;
  addCallbackFn: (type: ScannedKeysType, id: string, fun: (readedKeys: string) => void) => void;
  removeCallbackFn: (type: ScannedKeysType, id: string) => void;
  addReadingCallbackFn: (id: string, fun: (readingKeys: string) => void) => void;
  removeReadingCallbackFn: (id: string) => void;
}

export const ScannerContext = createContext<ScannerContext | null>(null);

export const useScannerContext = () => {
  const context = useContext(ScannerContext);

  if (context === null) {
    throw new Error("useScannerContext must be used within a ScannerProvider");
  }

  return context;
};
