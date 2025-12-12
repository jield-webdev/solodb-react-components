import { ServiceEventReportResult } from '../interfaces/service/event/report/serviceEventReportResult';
export default function ListReportResult({ id }: {
    id: number;
}): Promise<ServiceEventReportResult[]>;
