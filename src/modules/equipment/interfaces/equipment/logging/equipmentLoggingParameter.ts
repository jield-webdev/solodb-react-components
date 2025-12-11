import { Parameter as ProcessParameter } from "@/modules/process/interfaces/parameter";
import { Unit } from "@/modules/process/interfaces/unit";

export interface EquipmentLoggingParameter {
  id: number;
  name: string;
  parameter: ProcessParameter | null;
  unit: Unit | null;
}
