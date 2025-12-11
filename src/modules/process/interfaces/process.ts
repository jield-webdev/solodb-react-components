import { Category } from "@/modules/process/interfaces/category";

export interface Process {
  id: number;
  name: string;
  number: number;
  category: Category;
  is_active: boolean;
  is_private: boolean;
}
