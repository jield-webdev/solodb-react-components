import axios from "axios";
import { Setup } from "../interfaces/setup";

export default async function GetSetup({ id }: { id: number }) {
  const response = await axios.get<Setup>("view/setup/" + id);
  const { data } = response;

  return data;
}
