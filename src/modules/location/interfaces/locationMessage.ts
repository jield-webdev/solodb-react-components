import { MessageType } from "@/modules/location/interfaces/message/messageType";
import { User } from "@/modules/core/interfaces/user";
import { Room } from "@/modules/room/interfaces/room";

export interface LocationMessage {
  id: number;
  title: string;
  description: string;
  date_created: string;
  last_update: string | null;
  type: MessageType;
  owner: User;
  updated_by: User | null;
  rooms: Room[];
}
