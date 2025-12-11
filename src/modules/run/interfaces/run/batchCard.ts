import { User } from "@/modules/core/interfaces/user";

export interface BatchCard {
  id: number;
  content: string;
  user: User;
  date_created: string;
  last_update?: string;
}
