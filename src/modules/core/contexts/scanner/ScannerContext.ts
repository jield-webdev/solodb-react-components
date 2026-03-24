import { createContext, useContext } from "react";

export interface ScannerContext {
  readingKeys: string;
  readKeys: string;
  addCallbackFn: (id: string, fun: (readedKeys: string) => void) => void;
  removeCallbackFn: (id: string) => void;
}

export const ScannerContext = createContext<ScannerContext>({
  readingKeys: "",
  readKeys: "",
  addCallbackFn: () => {},
  removeCallbackFn: () => {},
});

export const useScannerContext = () => {
  const context = useContext(ScannerContext);

  if (context === undefined) {
    throw new Error("useScannerContext must be used within a ScannerProvider");
  }

  return context;
};
