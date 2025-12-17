import { ServiceEventReportResult } from 'solodb-typescript-core';
export default function Criterion({ result, value, onChange, error, onSubmit, saving, }: {
    result: ServiceEventReportResult;
    value: any;
    onChange: (cv: ServiceEventReportResult, raw: any) => void;
    error?: string;
    onSubmit: (cv: ServiceEventReportResult) => void;
    saving?: boolean;
}): import("react/jsx-runtime").JSX.Element;
