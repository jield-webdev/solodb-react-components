import { ZoneGroup } from "@/modules/room/interfaces/zoneGroup";

export interface Location {
  id: number;
  name: string;
  code: string;
  amount: {
    containers: number;
  };
  zone_group: ZoneGroup;
}
