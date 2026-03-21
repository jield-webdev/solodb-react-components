import { createContext } from "react";

export interface ScannerContext {
  readingKeys: string;
  readedKeys: string;
}

export const ScannerContext = createContext<ScannerContext>({
  readingKeys: "",
  readedKeys: "",
});
