import { Room } from "@/modules/room/interfaces/room";

export interface ZoneGroup {
  id: number;
  name: string;
  description: string | null;
  capacity: number;
  room: Room;
  amount: {
    zones: number;
    locations: number;
  };
}
