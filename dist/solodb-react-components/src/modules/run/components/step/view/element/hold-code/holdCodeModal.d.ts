import { Run, HoldCode as RunHoldCode } from '../../../../../../../../../solodb-typescript-core/src/index.ts';
declare const HoldCodeModal: ({ run, show, setShow, runHoldCode, setRunHoldCode, }: {
    run: Run;
    show: boolean;
    setShow: (set: boolean) => void;
    runHoldCode?: RunHoldCode;
    setRunHoldCode: (runHoldCode?: RunHoldCode) => void;
}) => import("react/jsx-runtime").JSX.Element;
export default HoldCodeModal;
