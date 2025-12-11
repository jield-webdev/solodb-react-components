import { ProcessModule } from "@/modules/process/interfaces/module";

export interface MonitorStep {
  id: number;
  process_module: ProcessModule;
}
