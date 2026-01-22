import BarcodeScanElement from "@jield/solodb-react-components/modules/chemical/components/chemical/barcodeScanElement";
import { Run } from "@jield/solodb-typescript-core";
import { QRCodeSVG } from "qrcode.react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

export default function SelectRunWithQrScanner({
  setRun,
  runsList,
}: {
  setRun: (run: Run) => void;
  runsList: Run[];
}) {
  const { control, watch, reset } = useForm<{
    barcode: string;
  }>({
    defaultValues: {
      barcode: "",
    },
  });

  const barcodeValue = watch("barcode");

  useEffect(() => {
    const handler = setTimeout(() => {
      // Ignore processing if the barcode includes /l/'
      if (barcodeValue?.includes("/l/")) {
        return;
      }

      // When the barcode contains /r/ it is a run 
      if (barcodeValue?.includes("/r/")) {
        const runId = barcodeValue.split("/r/")[1];
        const foundRun = runsList.find((run) => run.id === Number(runId));
        if (foundRun !== undefined) {
            setRun(foundRun);
            resetForm();
        }
      }
    }, 1000);

    return () => {
      clearTimeout(handler); // Cleanup timeout on changes
    };
  }, [barcodeValue, reset]);

  useEffect(() => {
    let scannedCode = ""; // Accumulates the scanner input

    const handleKeyDown = (event: KeyboardEvent) => {
      // Ignore inputs coming from physical keyboard if barcode scanner is exclusively expected
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return; // Don't process if the user is typing into a text field or textarea
      }

      // Ignore modifier keys like Shift, Ctrl, Alt, etc.
      if (event.key.length > 1 && event.key !== "Enter") {
        return;
      }

      if (event.key === "Enter") {
        // Perform actions on Enter key
        if (scannedCode === "reset-form") {
          resetForm(); // Reset the form
        }
        scannedCode = ""; // Reset the scanned code after processing
      } else {
        scannedCode += event.key; // Append the key to the accumulated code
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [reset]);

  const resetForm = () => {
    reset({ barcode: "" });
  };

  return (
    <div className="d-flex flex-column justify-content-between">
      <BarcodeScanElement control={control} />
      <div className="d-flex flex-column">
        <QRCodeSVG value={"reset-form"} size={100} className={"float-end"} onClick={() => resetForm()} />
        <span className={"text-muted"}>Reset form</span>
      </div>
    </div>
  );
}
