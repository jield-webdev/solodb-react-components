import { Run } from '@jield/solodb-typescript-core';
export default function NavigateInRunWithQrScanner({ runsList, setRun, setRunStepPartId, setRunPartId, setRunPartLabel, }: {
    runsList: Run[];
    setRun: (run: Run) => void;
    setRunStepPartId?: (stepPart: number) => void;
    setRunPartId?: (part: number) => void;
    setRunPartLabel?: (label: string) => void;
}): import("react/jsx-runtime").JSX.Element;
