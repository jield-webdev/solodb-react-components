import { Controller } from "react-hook-form";
import React from "react";
import { Form } from "react-bootstrap";

export default function BarcodeScanElement({ control }: { control: any }) {
  return (
    <Form.Group className="mb-3" controlId="chemical.scanBarcode">
      <Controller
        name="barcode"
        control={control}
        render={({ field }) => (
          <input
            {...field}
            id={"chemical.scanBarcodeElement"}
            type="text"
            autoFocus={true}
            placeholder="Scan or enter barcode"
            className="form-control form-control-lg"
          />
        )}
      />
    </Form.Group>
  );
}
