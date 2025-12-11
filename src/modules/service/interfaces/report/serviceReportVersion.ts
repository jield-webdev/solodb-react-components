import { ServiceReportType } from "@/modules/service/interfaces/report/serviceReportType";

export interface ServiceReportVersion {
  id: number;
  label: string;
  description: string | null;
  report_type: ServiceReportType;
  date_created: string;
  last_update: string | null;
}
