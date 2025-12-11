import { ProcessModule } from "@/modules/process/interfaces/module";

export interface Recipe {
  id: number;
  name: string;
  process_module: ProcessModule;
}
