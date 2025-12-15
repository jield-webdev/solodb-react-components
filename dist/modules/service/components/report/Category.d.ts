import { ServiceEventReportResult } from '../../interfaces/service/event/report/serviceEventReportResult';
export default function Category({ categoryId, label, results, }: {
    categoryId: string | number;
    label: string;
    results: ServiceEventReportResult[];
}): import("react/jsx-runtime").JSX.Element;
