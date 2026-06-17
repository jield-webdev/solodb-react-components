import { default as React } from 'react';
import { RunStep } from '@jield/solodb-typescript-core';
export default function UploadFilesToStep({ runStep, refetchFn }: {
    runStep: RunStep;
    refetchFn?: () => void;
}): React.JSX.Element;
