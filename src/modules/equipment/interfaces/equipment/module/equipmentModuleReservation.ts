import { User } from "@/modules/core/interfaces/user";
import { EquipmentModule } from "@/modules/equipment/interfaces/equipment/equipmentModule";

export interface EquipmentModuleReservation {
  id: number;
  start: string;
  end: string;
  title: string;
  color: string;
  is_technical_reservation: boolean;
  is_preventive_maintenance: boolean;
  user: User;
  modules: EquipmentModule[];
  active?: boolean;
}
