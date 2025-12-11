import { Room } from "@/modules/room/interfaces/room";
import { EquipmentModuleStatus } from "@/modules/equipment/interfaces/equipment/module/equipmentModuleStatus";
import { EquipmentProperty } from "./equipment/equipmentProperty";

export enum EquipmentGrade {
  "Equipment" = 1,
  "Accessory" = 2,
  "Storage" = 3,
}

export interface Equipment {
  id: number;
  name: string;
  number: string;
  mes_name: string;
  active: boolean;
  active_in_mes: boolean;
  reservation_possible: boolean;
  has_setup: boolean;
  is_main_in_setup: boolean;
  main_tool_module_id: number | null;
  main_tool_latest_status?: EquipmentModuleStatus;
  properties?: EquipmentProperty[];
  room: Room;
  types: string[];
  grade: EquipmentGrade;
  area: string;
  facility: string;
}
