import axios from "axios";
import { Equipment } from "@/modules/equipment/interfaces/equipment";

export default async function GetEquipment({ id }: { id: number }) {
  const response = await axios.get<Equipment>("view/equipment/" + id);
  const { data } = response;
  return data;
}
