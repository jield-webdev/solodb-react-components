import axios from "axios";
import { Run } from "@/modules/run/interfaces/run";

export default async function GetRun({ id }: { id: number }) {
  let url = "view/run/" + id;

  const response = await axios.get<Run>(url);
  const { data } = response;
  return data;
}
