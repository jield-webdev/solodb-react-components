import { ServiceReportCriterionType } from "@/modules/service/interfaces/report/criterion/serviceReportCriterionType";
import { ServiceReportCriterion } from "@/modules/service/interfaces/report/serviceReportCriterion";

export interface ServiceReportCriterionVersion {
  id: number;
  sequence: number;
  required: boolean;
  highlighted: boolean;
  default_value: string;
  criterion: ServiceReportCriterion;
  type: ServiceReportCriterionType;
}
