import { Run } from '@jield/solodb-typescript-core';
export default function NavigateInRunWithQrScanner({ runsList, setRun, setRunStepPartId, setRunPartId, }: {
    runsList: Run[];
    setRun: (run: Run) => void;
    setRunStepPartId?: (stepPart: number) => void;
    setRunPartId?: (part: number) => void;
}): import("react/jsx-runtime").JSX.Element;
