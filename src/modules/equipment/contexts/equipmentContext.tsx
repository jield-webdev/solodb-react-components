import { createContext } from "react";
import { Equipment } from "@jield/solodb-typescript-core";

interface EquipmentContext {
  equipment: Equipment;
  reloadEquipment: () => void;
}

export const EquipmentContext = createContext<EquipmentContext>({
  equipment: {} as Equipment,
  reloadEquipment: () => {},
});
