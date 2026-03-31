import { Run, RunStep } from '@jield/solodb-typescript-core';
type Props = {
    run: Run;
    runStep: RunStep;
    refetchFn?: () => void;
};
declare const RunPartsRegularFlow: ({ run, runStep, refetchFn }: Props) => import("react/jsx-runtime").JSX.Element;
export default RunPartsRegularFlow;
