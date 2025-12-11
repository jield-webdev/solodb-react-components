import { HoldCode as HoldCodeInterface } from "@/modules/run/interfaces/holdCode";

export interface HoldCode {
  id: number;
  hold_code: HoldCodeInterface;
  description: string;
}
