import { createContext } from "react";
import { Equipment } from "@/modules/equipment/interfaces/equipment";

interface EquipmentContext {
  equipment: Equipment;
  reloadEquipment: () => void;
}

export const EquipmentContext = createContext<EquipmentContext>({
  equipment: {} as Equipment,
  reloadEquipment: () => {},
});
