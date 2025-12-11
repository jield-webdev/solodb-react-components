import { Type } from "@/modules/process/interfaces/type";

export interface Category {
  id: number;
  name: string;
  number: number;
  types: Type[];
  amount_of_processes: number;
}
