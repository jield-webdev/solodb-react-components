import { Equipment } from "@/modules/equipment/interfaces/equipment";
import { EquipmentModuleStatus } from "@/modules/equipment/interfaces/equipment/module/equipmentModuleStatus";

export interface EquipmentModule {
  id: number;
  name: string;
  mes_name: string;
  active: boolean;
  type: EquipmentModuleType;
  latest_module_status?: EquipmentModuleStatus;
  equipment: Equipment;
}

export interface EquipmentModuleType {
  id: number;
  type: string;
  is_main_tool: boolean;
}
