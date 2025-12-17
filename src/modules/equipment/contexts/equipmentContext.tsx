import { createContext } from "react";
import { Equipment } from "solodb-typescript-core";

interface EquipmentContext {
  equipment: Equipment;
  reloadEquipment: () => void;
}

export const EquipmentContext = createContext<EquipmentContext>({
  equipment: {} as Equipment,
  reloadEquipment: () => {},
});
