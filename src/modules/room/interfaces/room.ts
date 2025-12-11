import { Building } from "@/modules/room/interfaces/building";

export interface Room {
  id: number;
  name: string;
  code: string;
  phone: string | null;
  description: string | null;
  building: Building;
  amount: {
    zone_groups: number;
  };
}
