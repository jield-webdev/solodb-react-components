import axios from "axios";
import { RunStep } from "@/modules/run/interfaces/runStep";

export default async function GetRunStep({ id }: { id: number }) {
  let url = "view/run/step/" + id;

  const response = await axios.get<RunStep>(url);
  const { data } = response;
  return data;
}
