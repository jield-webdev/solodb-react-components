import { createContext } from "react";
import { StatusMail } from "@jield/solodb-typescript-core";

interface StatusMailContext {
  statusMail: StatusMail;
}

export const StatusMailContext = createContext<StatusMailContext>({
  statusMail: {} as StatusMail,
});
