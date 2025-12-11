import { SetupEquipment } from "@/modules/equipment/interfaces/setup/equipment";
import { Zone } from "@/modules/room/interfaces/zone";

export type Setup = {
  id: number;
  title: string;
  description: string;
  zone: Zone;
  setup_equipment: SetupEquipment[];
};
