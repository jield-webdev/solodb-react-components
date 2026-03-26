import { createContext, useContext } from "react";

export interface ScannerContext {
  lastlyReadedKeys: string;
  addCallbackFn: (id: string, fun: (readedKeys: string) => void) => void;
  removeCallbackFn: (id: string) => void;
  addReadingCallbackFn: (id: string, fun: (readingKeys: string) => void) => void;
  removeReadingCallbackFn: (id: string) => void;
}

export const ScannerContext = createContext<ScannerContext>({
  lastlyReadedKeys: "",
  addCallbackFn: () => {},
  removeCallbackFn: () => {},
  addReadingCallbackFn: () => {},
  removeReadingCallbackFn: () => {},
});

export const useScannerContext = () => {
  const context = useContext(ScannerContext);

  if (context === undefined) {
    throw new Error("useScannerContext must be used within a ScannerProvider");
  }

  return context;
};
