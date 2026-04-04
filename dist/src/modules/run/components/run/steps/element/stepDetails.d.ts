import { RunStep, Run } from '@jield/solodb-typescript-core';
export default function StepDetails({ run, step, refetchFn, }: {
    run?: Run;
    step: RunStep;
    refetchFn?: (keys: any[]) => void;
}): import("react/jsx-runtime").JSX.Element | null;
