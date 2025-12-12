import { ServiceReportCriterionVersion } from '../../../report/criterion/serviceReportCriterionVersion';
export interface ServiceEventReportResult {
    id: number;
    event_report: number;
    value: number | string | null;
    comment: string | null;
    date_created: string;
    date_updated: string | null;
    date_changed: string | null;
    criterion_version: ServiceReportCriterionVersion;
}
