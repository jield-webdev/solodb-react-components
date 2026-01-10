import { ServiceEventReportResult } from '../../../../../../solodb-typescript-core/src/index.ts';
export default function Category({ categoryId, label, results, }: {
    categoryId: string | number;
    label: string;
    results: ServiceEventReportResult[];
}): import("react/jsx-runtime").JSX.Element;
