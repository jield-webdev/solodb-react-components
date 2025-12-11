import { createContext } from "react";
import { RunStep } from "@/modules/run/interfaces/runStep";
import { ModalProperties } from "@/modules/core/interfaces/modalProperties";
import { Run } from "@/modules/run/interfaces/run";

interface RunStepContext {
  runStep: RunStep;
  setRunStep: (runStep: RunStep) => void;
  reloadRunStep: () => void;
  run: Run;
  modalProperties: ModalProperties;
  setModalProperties: (modalProperties: ModalProperties) => void;
}

export const RunStepContext = createContext<RunStepContext>({
  runStep: {} as RunStep,
  setRunStep: (runStep) => {},
  reloadRunStep: () => {},
  run: {} as Run,
  modalProperties: {} as ModalProperties,
  setModalProperties: (modalProperties: ModalProperties) => {},
});
