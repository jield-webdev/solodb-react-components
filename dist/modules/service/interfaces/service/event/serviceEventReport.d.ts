import { ServiceEvent } from '../serviceEvent';
import { ServiceReportVersion } from '../../report/serviceReportVersion';
export interface ServiceEventReport {
    id: number;
    event: ServiceEvent;
    date_created: string;
    last_update: string | null;
    version: ServiceReportVersion;
}
