import { Run } from '@jield/solodb-typescript-core';
export default function NavigateInRunWithQrScanner({ runsList, setRun, setRunPartLabel, }: {
    runsList: Run[];
    setRun: (run: Run) => void;
    setRunPartLabel?: (label: string) => void;
}): import("react/jsx-runtime").JSX.Element;
