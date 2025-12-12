import { ServiceEventReportResult } from '../interfaces/service/event/report/serviceEventReportResult';
export default function listServiceEventReportResult({ id }: {
    id: Number;
}): Promise<ServiceEventReportResult[]>;
