import { Priority as PriorityInterface } from "@/modules/run/interfaces/priority";

export interface Priority {
  id: number;
  priority: PriorityInterface;
  description: string;
}
