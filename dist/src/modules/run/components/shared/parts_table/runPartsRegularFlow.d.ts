import { default as React } from 'react';
import { Run, RunStep } from '@jield/solodb-typescript-core';
type Props = {
    run: Run;
    runStep: RunStep;
};
declare const RunPartsRegularFlow: ({ run, runStep }: Props) => React.JSX.Element;
export default RunPartsRegularFlow;
