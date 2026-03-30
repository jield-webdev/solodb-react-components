import { useScannerContext } from "@jield/solodb-react-components/modules/core/contexts/scanner/ScannerContext";
import { notification } from "@jield/solodb-react-components/utils/notification";
import { Run } from "@jield/solodb-typescript-core";
import { useCallback, useEffect, useId, useState } from "react";
import { ScannedKeysType } from "../../../utils/parseScannerForRun";

export default function NavigateInRunWithQrScanner({
  runsList,
  setRun,
  setRunPartLabel,
}: {
  runsList: Run[];
  setRun: (run: Run) => void;
  setRunPartLabel?: (label: string) => void;
}) {
  const { lastlyReadedKeys, addCallbackFn, removeCallbackFn, addReadingCallbackFn, removeReadingCallbackFn } = useScannerContext();
  const callbackId = useId();
  const [readingKeys, setReadingKeys] = useState<string>("");

  useEffect(() => {
    addReadingCallbackFn(callbackId, setReadingKeys);
    return () => removeReadingCallbackFn(callbackId);
  }, []);

  const onReadKeys = useCallback(
    (keys: string) => {
      const normalizedRead = keys.replace(/_/g, "-").toUpperCase();
      const runPartBadgeParsed = normalizedRead.split("-");
      if (!(runPartBadgeParsed.length == 4 || runPartBadgeParsed.length == 3)) {
        notification({
          notificationHeader: "Run scanner",
          notificationBody: "Part not found, found " + runPartBadgeParsed.length + " splits in " + normalizedRead,
          notificationType: "danger",
        });
        return;
      }

      const foundRun = runsList.find((run) => run.label === `${runPartBadgeParsed[0]}-${runPartBadgeParsed[1]}`);
      const foundRunPartLabel = normalizedRead;

      if (!foundRun) {
        notification({
          notificationHeader: "Run scanner",
          notificationBody: `Run not found`,
          notificationType: "danger",
        });
        return;
      }

      if (!foundRunPartLabel) {
        notification({
          notificationHeader: "Run scanner",
          notificationBody: `Part label not found`,
          notificationType: "danger",
        });
        return;
      }

      if (setRun !== undefined) {
        notification({
          notificationHeader: "Run scanner",
          notificationBody: `Found run ${foundRun.label}`,
          notificationType: "success",
        });
      }
      if (setRunPartLabel !== undefined) setRunPartLabel(runPartBadgeParsed[2]);
    },
    [runsList, setRun, setRunPartLabel]
  );

  useEffect(() => {
    removeCallbackFn(ScannedKeysType.SELECT, callbackId);
    onReadKeys(lastlyReadedKeys);
    addCallbackFn(ScannedKeysType.SELECT, callbackId, onReadKeys);

    return () => {
      removeCallbackFn(ScannedKeysType.SELECT, callbackId);
    };
  }, [runsList]);

  return (
    <div className="d-flex flex-row gap-3">
      <div className="d-flex flex-column">
        <div className={"h3"}>
          Reading: <span className={"font-monospace"}>{readingKeys}</span>
        </div>
      </div>
    </div>
  );
}
