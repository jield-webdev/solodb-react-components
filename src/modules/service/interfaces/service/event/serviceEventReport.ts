import { ServiceEvent } from "@/modules/service/interfaces/service/serviceEvent";
import { ServiceReportVersion } from "@/modules/service/interfaces/report/serviceReportVersion";

export interface ServiceEventReport {
  id: number;
  event: ServiceEvent;
  date_created: string;
  last_update: string | null;
  version: ServiceReportVersion;
}
