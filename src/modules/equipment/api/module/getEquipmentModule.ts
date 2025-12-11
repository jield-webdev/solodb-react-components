import axios from "axios";
import { EquipmentModule } from "@/modules/equipment/interfaces/equipment/equipmentModule";

export default async function GetEquipmentModule({ id }: { id: number }) {
  const response = await axios.get<EquipmentModule>("view/equipment/module/" + id);
  const { data } = response;
  return data;
}
