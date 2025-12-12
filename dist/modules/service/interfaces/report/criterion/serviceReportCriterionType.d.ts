import { ServiceReportcriterionCategory } from './serviceReportcriterionCategory';
export interface ServiceReportCriterionType {
    id: number;
    type: string;
    category: ServiceReportcriterionCategory;
    sequence: number;
    date_created: string;
    last_update: string | null;
}
