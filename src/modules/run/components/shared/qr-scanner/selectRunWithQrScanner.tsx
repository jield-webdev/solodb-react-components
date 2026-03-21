import { ScannerContext } from "@jield/solodb-react-components/modules/core/contexts/scanner/ScannerContext";
import Notification, { type NotificationType } from "@jield/solodb-react-components/utils/notification";
import { Run } from "@jield/solodb-typescript-core";
import { useContext, useEffect, useState } from "react";

export default function NavigateInRunWithQrScanner({
  runsList,
  setRun,
  setRunPartLabel,
}: {
  runsList: Run[];
  setRun: (run: Run) => void;
  setRunPartLabel?: (label: string) => void;
}) {
  const [notification, setNotification] = useState<NotificationType>({ text: "", show: false, variant: "success" });

  const { readedKeys, readingKeys } = useContext(ScannerContext);

  useEffect(() => {
    const normalizedRead = readedKeys.replace(/_/g, "-").toUpperCase();
    const runPartBadgeParsed = normalizedRead.split("-");
    if (!(runPartBadgeParsed.length == 4 || runPartBadgeParsed.length == 3)) {
      setNotification({
        text: "Part not found, found " + runPartBadgeParsed.length + " splits in " + normalizedRead,
        show: true,
        variant: "danger",
      });
      return;
    }

    const foundRun = runsList.find((run) => run.label === `${runPartBadgeParsed[0]}-${runPartBadgeParsed[1]}`);
    const foundRunPartLabel = normalizedRead;

    if (!foundRun) {
      setNotification({ text: "Run not found", show: true, variant: "danger" });
      return;
    }

    if (!foundRunPartLabel) {
      setNotification({ text: "Part label not found", show: true, variant: "danger" });
      return;
    }

    if (setRun !== undefined) {
      setNotification({ text: `Found run ${foundRun.label}`, show: true, variant: "success" });
      setRun(foundRun);
    }
    if (setRunPartLabel !== undefined) setRunPartLabel(runPartBadgeParsed[2]);
  }, [readedKeys]);

  return (
    <div className="d-flex flex-row gap-3">
      <div className="d-flex flex-column">
        <div className={"h3"}>
          Reading: <span className={"font-monospace"}>{readingKeys}</span>
        </div>
      </div>
      <Notification notification={notification} setNotification={setNotification} />
    </div>
  );
}
