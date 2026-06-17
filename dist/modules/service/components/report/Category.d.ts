import { default as React } from 'react';
import { ServiceEventReportResult } from '@jield/solodb-typescript-core';
export default function Category({ categoryId, label, results, }: {
    categoryId: string | number;
    label: string;
    results: ServiceEventReportResult[];
}): React.JSX.Element;
