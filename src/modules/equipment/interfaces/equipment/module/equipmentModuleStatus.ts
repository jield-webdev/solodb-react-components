import { EquipmentStatus } from "@/modules/equipment/interfaces/equipmentStatus";
import { User } from "@/modules/core/interfaces/user";
import { EquipmentModuleStatusAttachment } from "@/modules/equipment/interfaces/equipment/module/status/equipmentModuleStatusAttachment";

export interface EquipmentModuleStatus {
  id: number;
  status: EquipmentStatus;
  description: string;
  user: User;
  date_created: string;
  attachments: EquipmentModuleStatusAttachment[];
}
