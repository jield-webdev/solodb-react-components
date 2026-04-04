import { ServiceEventReportResult } from '@jield/solodb-typescript-core';
type SaveStatusState = "idle" | "dirty" | "saving" | "saved" | "error";
type SaveStatus = {
    state: SaveStatusState;
    message?: string;
    savedAt?: number;
};
export default function Criterion({ result, status, onAutoSave, onDirty, }: {
    result: ServiceEventReportResult;
    status?: SaveStatus;
    onAutoSave: (cv: ServiceEventReportResult) => void;
    onDirty: (resultId: number) => void;
}): import("react/jsx-runtime").JSX.Element;
export {};
