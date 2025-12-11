import { EquipmentModuleEcn } from "@/modules/equipment/interfaces/equipment/module/equipmentModuleEcn";

export interface EquipmentModuleEcnAttachment {
  id: number;
  date_created: string;
  filename: string;
  mime_type: string;
  file_size: number;
  url: string;
  ecn: EquipmentModuleEcn;
}
