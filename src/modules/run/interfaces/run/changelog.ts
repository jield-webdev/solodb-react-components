import { RunStep } from "@/modules/run/interfaces/runStep";
import { RunStepChecklistItem } from "@/modules/run/interfaces/step/runStepChecklistItem";
import { User } from "@/modules/core/interfaces/user";

export interface Changelog {
  id: number;
  date_created: string;
  user: User;
  message: string;
  type: string;
  source: string;
  steps: RunStep[];
  checklist: RunStepChecklistItem[];
}
