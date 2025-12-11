import { createContext } from "react";
import { Run } from "@/modules/run/interfaces/run";

interface RunContext {
  run: Run;
  reloadRun: () => void;
}

export const RunContext = createContext<RunContext>({
  run: {} as Run,
  reloadRun: () => {},
});
