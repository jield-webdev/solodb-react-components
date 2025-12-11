import axios from "axios";
import { User } from "@/modules/core/interfaces/user";

export default async function GetMe() {
  const response = await axios.get<User>("me");
  const { data } = response;
  return data;
}
