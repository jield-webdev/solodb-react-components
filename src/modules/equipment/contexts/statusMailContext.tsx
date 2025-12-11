import { createContext } from "react";
import { StatusMail } from "@/modules/equipment/interfaces/statusMail";

interface StatusMailContext {
  statusMail: StatusMail;
}

export const StatusMailContext = createContext<StatusMailContext>({
  statusMail: {} as StatusMail,
});
