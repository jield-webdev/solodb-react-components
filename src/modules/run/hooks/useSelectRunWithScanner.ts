import { useEffect, useState } from "react";
import { Run } from "@jield/solodb-typescript-core";
import { useScannerContext } from "../../core/contexts/scanner/ScannerContext";
import { notification } from "@jield/solodb-react-components/index";

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

  const { lastlyReadedKeys } = useScannerContext();

  useEffect(() => {
    const normalizedRead = lastlyReadedKeys.replace(/_/g, "-").toUpperCase();

    const foundRun = runsList.find((run) => normalizedRead.includes(run.label));

    if (!foundRun) {
      onFail(FailStatus.RunNotFound);
      return;
    }

    notification({notificationHeader: "Run scanner", notificationBody: `Run ${foundRun.label} found`, notificationType: "success"});
    setRun(foundRun); 
  }, [lastlyReadedKeys]);

  return { selectedRun: run };
}
