import React, { useCallback, useContext, useEffect, useId, useState } from "react";
import { Alert, Button, Col, Dropdown, DropdownButton, Form, InputGroup } from "react-bootstrap";
import { Controller, useForm } from "react-hook-form";
import axios from "axios";
import LocationSelectFormElement from "@jield/solodb-react-components/modules/chemical/form/locationSelectFormElement";
import ChemicalSelectFormElement from "@jield/solodb-react-components/modules/chemical/form/chemicalSelectFormElement";
import { QRCodeSVG } from "qrcode.react";
import UserFormElement from "@jield/solodb-react-components/modules/core/form/element/userFormElement";
import { AuthContext } from "@jield/solodb-react-components/modules/core/contexts/authContext";
import { useParams } from "react-router-dom";
import {
  ChemicalContainer,
  getLocation,
  Room,
  Location,
  listChemicalContainerExternalLabels,
} from "@jield/solodb-typescript-core";
import { useScannerContext } from "@jield/solodb-react-components/modules/core/contexts/scannerContext";
import { ScannedKeysType } from "@jield/solodb-react-components/modules/core/utils/parseScannerType";
import {
  AMOUNT_UNITS,
  scannedCodeIsLocationCode,
  extractLabelNumber,
  getDefaultExpireDate,
} from "@jield/solodb-react-components/modules/chemical/utils/chemicalContainerUtils";

export { AMOUNT_UNITS, scannedCodeIsLocationCode, extractLabelNumber };

type Inputs = {
  location: number;
  chemical: number;
  concentration: number;
  expire_date: string;
  amount: number;
  amount_unit: string | null;
  owner: {
    value: number;
    label: string;
  };
};

export default function RegisterBarcodeElement({
  room,
  barcode,
  resetForm,
  location,
  setLocation,
}: {
  room: Room;
  barcode: string;
  resetForm: () => void;
  location: Location | null;
  setLocation: (location: Location | null) => void;
}) {
  const { user } = useContext(AuthContext);
  const { environment } = useParams();
  const { addCallbackFn, removeCallbackFn } = useScannerContext();

  const [createdContainer, setCreatedContainer] = useState<ChemicalContainer | null>(null);

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<Inputs>({
    defaultValues: {
      expire_date: getDefaultExpireDate(),
      owner: { value: user?.id, label: user?.full_name },
    },
  });

  const locationId = watch("location");

  useEffect(() => {
    if (!locationId) return;
    getLocation({ id: locationId }).then((loc) => setLocation(loc));
  }, [locationId]);

  // Scanner: handle location QR scans
  const callbackId = useId();

  const onScanKeys = useCallback(
    (keys: string) => {
      if (scannedCodeIsLocationCode(keys)) {
        const id = extractLabelNumber(keys);
        if (id !== null) {
          getLocation({ id }).then((loc) => setLocation(loc));
          setValue("location", id);
        }
      }

      if (keys.startsWith("reset-scan-location")) {
        resetScannedLocation();
      }
    },
    [setValue]
  );

  useEffect(() => {
    removeCallbackFn(ScannedKeysType.WILD_CARD, callbackId);
    addCallbackFn(ScannedKeysType.WILD_CARD, callbackId, onScanKeys);
    return () => removeCallbackFn(ScannedKeysType.WILD_CARD, callbackId);
  }, [setValue]);

  const onSubmit = async (values: Inputs) => {
    (values as any).user = values.owner.value;

    const existingBarcode = await listChemicalContainerExternalLabels({ qrCodeContent: barcode });
    if (existingBarcode.items.length > 0) {
      alert("This barcode is already registered to a container");
      return;
    }

    const response = await axios.post("create/chemical/container", values);
    setCreatedContainer(response.data);

    await axios.post("create/chemical/container/external-label", {
      container: response.data.id,
      qr_code_content: barcode,
    });
  };

  const resetScannedLocation = () => {
    setLocation(null);
    setValue("location", 0);
  };

  return (
    <>
      <Form onSubmit={handleSubmit(onSubmit)}>
        {!location && <LocationSelectFormElement room={room} control={control} name="location" />}

        {location && (
          <Form.Group className="mb-3">
            <Form.Label>Scanned location</Form.Label>
            <Col>
              <div className="d-flex justify-content-between">
                <span className="h1">{location.name}</span>
                <div className="d-flex flex-column">
                  <QRCodeSVG value="reset-scan-location" size={100} onClick={resetScannedLocation} />
                  <span className="text-muted">Reset location</span>
                </div>
              </div>
            </Col>
          </Form.Group>
        )}

        {location && (
          <>
            <ChemicalSelectFormElement
              control={control}
              errors={errors}
              setValue={setValue}
              {...register("chemical", { required: "Chemical is required" })}
            />

            <Form.Group className="mb-3">
              <Form.Label>Owner</Form.Label>
              <UserFormElement
                control={control}
                {...register("owner", { required: "Owner is required" })}
                name="owner"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Concentration</Form.Label>
              <InputGroup className="mb-3 w-25" hasValidation>
                <Form.Control
                  as="input"
                  {...register("concentration", { required: "A concentration is required" })}
                  isInvalid={errors.concentration !== undefined}
                />
                {errors.concentration && (
                  <Form.Control.Feedback type="invalid">{errors.concentration.message}</Form.Control.Feedback>
                )}
              </InputGroup>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Amount</Form.Label>
              <InputGroup className="mb-3 w-25" hasValidation>
                <Form.Control
                  as="input"
                  {...register("amount", { required: "An amount is required" })}
                  isInvalid={errors.amount !== undefined}
                />
                <Controller
                  name="amount_unit"
                  control={control}
                  render={({ field }) => (
                    <DropdownButton
                      id="input-group-dropdown-1"
                      title={field.value || "(no unit)"}
                      onSelect={(eventKey) => field.onChange(eventKey)}
                    >
                      <Dropdown.Item key={0} eventKey="">
                        (no unit)
                      </Dropdown.Item>
                      {AMOUNT_UNITS.map((unit) => (
                        <Dropdown.Item key={unit.value} eventKey={unit.value}>
                          {unit.label} ({unit.value})
                        </Dropdown.Item>
                      ))}
                    </DropdownButton>
                  )}
                />
                {errors.amount && <Form.Control.Feedback type="invalid">{errors.amount.message}</Form.Control.Feedback>}
              </InputGroup>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Expire date</Form.Label>
              <Form.Control
                type="date"
                {...register("expire_date", { required: "An expire date is required" })}
                isInvalid={errors.expire_date !== undefined}
              />
              {errors.expire_date && (
                <Form.Control.Feedback type="invalid">{errors.expire_date.message}</Form.Control.Feedback>
              )}
            </Form.Group>

            <Button type="submit" variant="primary" disabled={isSubmitting}>
              {isSubmitting && <span className="spinner-border spinner-border-sm me-1" />}
              Register container
            </Button>
          </>
        )}
      </Form>

      {createdContainer && (
        <div className="mt-3">
          <Alert variant="success">Container registered successfully</Alert>
          <div className="d-flex justify-content-between align-items-center gap-2">
            <a
              className="btn btn-primary"
              href={`${environment}/chemical/container/details/${createdContainer.id}/general.html`}
            >
              Go to container
            </a>
            <QRCodeSVG value="reset-form" size={100} className="float-end" onClick={resetForm} />
          </div>
        </div>
      )}
    </>
  );
}
