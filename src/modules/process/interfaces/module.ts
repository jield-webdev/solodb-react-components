import { Process } from "@/modules/process/interfaces/process";
import { EquipmentModule } from "@/modules/equipment/interfaces/equipment/equipmentModule";

export interface ProcessModule {
  id: number;
  process: Process;
  module: EquipmentModule;
  in_use: boolean;
  is_assembly_process: boolean;
  has_local_parameters: boolean;
}
