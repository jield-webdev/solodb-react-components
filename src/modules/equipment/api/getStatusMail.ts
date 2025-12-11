import axios from "axios";
import { StatusMail } from "@/modules/equipment/interfaces/statusMail";

export default async function GetStatusMail({ id }: { id: number }) {
  const response = await axios.get<StatusMail>("view/status-mail/" + id);
  const { data } = response;
  return data;
}
