import { makeKeySequenceListener } from "@jield/solodb-react-components/utils/keySequenceListener";
import Notification, { type NotificationType } from "@jield/solodb-react-components/utils/notification";
import { Run } from "@jield/solodb-typescript-core";
import { QRCodeSVG } from "qrcode.react";
import { useEffect, useState } from "react";

export default function NavigateInRunWithQrScanner({
  runsList,
  setRun,
  setRunPartLabel,
}: {
  runsList: Run[];
  setRun: (run: Run) => void;
  setRunPartLabel?: (label: string) => void;
}) {
  const [readedKeys, setReadedKeys] = useState<string>("");
  const [notification, setNotification] = useState<NotificationType>({ text: "", show: false, variant: "success" });

  const setByPB = (readed: string) => {
    const runPartBadgeParsed = readed.split("-");
    if (!(runPartBadgeParsed.length == 4 || runPartBadgeParsed.length == 3)) {
      setNotification({ text: "Part not found", show: true, variant: "danger" });
      return;
    }

    const foundRun = runsList.find((run) => run.label === `${runPartBadgeParsed[0]}-${runPartBadgeParsed[1]}`);
    const foundRunPartLabel = (
      `${runPartBadgeParsed[2]}` + (runPartBadgeParsed[3] ? `-${runPartBadgeParsed[3]}` : "")
    ).replace("/", "");

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
    if (setRunPartLabel !== undefined) setRunPartLabel(foundRunPartLabel);
  };

  // With document listener for keys
  useEffect(() => {
    const listener = makeKeySequenceListener("*", setByPB, (keys) => {
      setReadedKeys(keys);
    });

    document.addEventListener("keyup", listener);

    return () => {
      document.removeEventListener("keyup", listener);
    };
  }, []);

  return (
    <div className="d-flex flex-row gap-3">
      <div className="d-flex flex-column">
        <QRCodeSVG value={"start-form"} size={100} className={"float-end"} onClick={() => {}} />
        <span className={"text-muted"}>Reading: {readedKeys}</span>
      </div>
      <Notification notification={notification} setNotification={setNotification} />
    </div>
  );
}
