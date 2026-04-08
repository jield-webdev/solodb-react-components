import { Run, RunStep, RunPart, Requirement } from '@jield/solodb-typescript-core';
export default function StepInList({ run, step, parts, monitoredBy, refetchFn, }: {
    run: Run;
    step: RunStep;
    parts: RunPart[];
    monitoredBy: Requirement | undefined;
    refetchFn: (key: any[]) => void;
}): import("react/jsx-runtime").JSX.Element;
