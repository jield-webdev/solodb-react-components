import { makeKeySequenceListener } from "@jield/solodb-react-components/utils/keySequenceListener";
import { Run } from "@jield/solodb-typescript-core";
import { QRCodeSVG } from "qrcode.react";
import { useEffect } from "react";

export default function NavigateInRunWithQrScanner({
  runsList,
  setRun,
  setRunPartLabel,
}: {
  runsList: Run[];
  setRun: (run: Run) => void;
  setRunStepPartId?: (stepPart: number) => void;
  setRunPartId?: (part: number) => void;
  setRunPartLabel?: (label: string) => void;
}) {
  const setByPB = (readed: string) => {
      const runPartBadgeParsed = readed.split("/pb/")[1].split("-");
      if (!(runPartBadgeParsed.length == 4 || runPartBadgeParsed.length == 3)) return;

      const foundRun = runsList.find((run) => run.label === `${runPartBadgeParsed[0]}-${runPartBadgeParsed[1]}`);
      const foundRunPartLabel = (`${runPartBadgeParsed[2]}` + (runPartBadgeParsed[3] ? `-${runPartBadgeParsed[3]}` : "")).replace('/', '');

      if (setRun !== undefined && foundRun) setRun(foundRun);
      if (setRunPartLabel !== undefined && foundRunPartLabel) setRunPartLabel(foundRunPartLabel);
  };

  // With document listener for keys
  useEffect(() => {
    const listener = makeKeySequenceListener("/pb/*/", setByPB);

    document.addEventListener("keyup", listener);

    return () => {
      document.removeEventListener("keyup", listener);
    };
  }, []);

  return (
    <div className="d-flex flex-row gap-3">
      <div className="d-flex flex-column">
        <QRCodeSVG value={"start-form"} size={100} className={"float-end"} onClick={() => {}} />
        <span className={"text-muted"}>Start QR</span>
      </div>
    </div>
  );
}
