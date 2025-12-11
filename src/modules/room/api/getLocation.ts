import axios from "axios";
import { Location } from "@/modules/room/interfaces/location";

export default async function GetLocation({ id }: { id: number }) {
  const response = await axios.get<Location>("view/location/" + id);
  const { data } = response;
  return data;
}
