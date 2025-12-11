import { RunStep } from "@/modules/run/interfaces/runStep";
import { Target } from "@/modules/run/interfaces/requirement/target";
import { Measurement } from "@/modules/run/interfaces/measurement";

export interface Requirement {
  id: number;
  definition: string;
  step: RunStep;
  requirement_for_step: RunStep | null;
  targets: Target[];
  measurement: Measurement;
}
