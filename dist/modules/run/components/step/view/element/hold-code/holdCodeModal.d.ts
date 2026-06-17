import { default as React } from 'react';
import { Run, HoldCode as RunHoldCode } from '@jield/solodb-typescript-core';
declare const HoldCodeModal: ({ run, show, setShow, runHoldCode, setRunHoldCode, }: {
    run: Run;
    show: boolean;
    setShow: (set: boolean) => void;
    runHoldCode?: RunHoldCode;
    setRunHoldCode: (runHoldCode?: RunHoldCode) => void;
}) => React.JSX.Element;
export default HoldCodeModal;
