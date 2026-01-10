import { createContext } from "react";
import { Run } from "@jield/solodb-typescript-core";

interface RunContext {
  run: Run;
  reloadRun: () => void;
}

export const RunContext = createContext<RunContext>({
  run: {} as Run,
  reloadRun: () => {},
});
