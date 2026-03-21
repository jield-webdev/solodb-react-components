import { useContext, useEffect, useState } from "react";
import { Run, getRun } from "@jield/solodb-typescript-core";
import { ScannerContext } from "@jield/solodb-react-components/index";

export const enum FailStatus {
    RunNotFound = "Run not found"
};

export default function useSelectRunWithScanner({
  runsList,
  onFail = (status: FailStatus) => null,
}: {
  runsList: Run[];
  onFail?: (status: FailStatus) => void;
}): { selectedRun: Run | null } {
  const [run, setRun] = useState<Run | null>(null);

  const { readedKeys } = useContext(ScannerContext);

  useEffect(() => {
    const normalizedRead = readedKeys.replace(/_/g, "-").toUpperCase();

    const foundRun = runsList.find((run) => normalizedRead.includes(run.label));

    if (!foundRun) {
      onFail(FailStatus.RunNotFound);
      return;
    }

    setRun(foundRun); 
  }, [readedKeys]);

  return { selectedRun: run };
}
