import { RunPart, RunStepPart } from "@jield/solodb-typescript-core";
import { useCallback, useEffect, useId } from "react";
import { isRunPartFinish } from "../../../components/shared/parts_table/runPartsQrFlow";
import { notification } from "@jield/solodb-react-components/utils/notification";
import { useScannerContext } from "@jield/solodb-react-components/modules/core/contexts/scannerContext";
import { ScannedKeysType } from "../../../../core/utils/parseScannerType";

type Props = {
  runStepParts: RunStepPart[];
  runParts: RunPart[];
};

export default function useQrPartNotifications({ runStepParts, runParts }: Props) {
  const { addCallbackFn, removeCallbackFn } = useScannerContext();
  const callbackId = useId();

  const onReadKeys = useCallback(
    (keys: string) => {
      const normalizedRead = keys.replace(/_/g, "-").toUpperCase();

      // TO prevent empty values
      if (!normalizedRead) return;

      const foundPart = runParts.find((p) => normalizedRead.includes(p.scanner_label.toUpperCase()));

      if (!foundPart) return;

      if (isRunPartFinish(runStepParts, foundPart)) {
        notification({
          notificationHeader: "Run parts table",
          notificationBody: `Part ${foundPart.parsed_label ?? foundPart.scanner_label} is already completed`,
          notificationType: "danger",
        });

        return;
      }

      notification({
        notificationHeader: "Part scanner",
        notificationBody: `Found part: ${foundPart.scanner_label}`,
        notificationType: "success",
      });
    },
    [runParts, runStepParts]
  );

  useEffect(() => {
    removeCallbackFn(ScannedKeysType.WILD_CARD, callbackId);
    addCallbackFn(ScannedKeysType.WILD_CARD, callbackId, onReadKeys);

    return () => {
      removeCallbackFn(ScannedKeysType.WILD_CARD, callbackId);
    };
  }, [runParts, runStepParts]);
}
