import { Run } from '../../../../../interfaces/run';
import { HoldCode as RunHoldCode } from '../../../../../interfaces/run/holdCode';
declare const HoldCodeModal: ({ run, show, setShow, runHoldCode, setRunHoldCode, }: {
    run: Run;
    show: boolean;
    setShow: (set: boolean) => void;
    runHoldCode?: RunHoldCode;
    setRunHoldCode: (runHoldCode?: RunHoldCode) => void;
}) => import("react/jsx-runtime").JSX.Element;
export default HoldCodeModal;
