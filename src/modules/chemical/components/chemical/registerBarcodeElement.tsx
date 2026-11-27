import React, { useCallback, useContext, useEffect, useId, useState } from "react";
import { Alert, Button, Col, Dropdown, DropdownButton, Form, InputGroup } from "react-bootstrap";
import { Controller, useForm } from "react-hook-form";
import LocationSelectFormElement from "@jield/solodb-react-components/modules/chemical/form/locationSelectFormElement";
import ChemicalSelectFormElement from "@jield/solodb-react-components/modules/chemical/form/chemicalSelectFormElement";
import { QRCodeSVG } from "qrcode.react";
import UserFormElement from "@jield/solodb-react-components/modules/core/form/element/userFormElement";
import { AuthContext } from "@jield/solodb-react-components/modules/core/contexts/authContext";
import { useParams } from "react-router-dom";
import {
  ChemicalContainer,
  ChemicalContainerAmountUnitEnum,
  createChemicalContainer,
  createChemicalContainerExternalLabel,
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
    getValues,
    formState: { errors, isSubmitting, submitCount },
  } = useForm<Inputs>({
    defaultValues: {
      location: location?.id ?? 0,
      expire_date: getDefaultExpireDate(),
      owner: { value: user?.id, label: user?.full_name },
    },
  });

  const locationId = watch("location");
  const chemical = watch("chemical");
  const concentration = watch("concentration");
  const amount = watch("amount");
  const missingItems = [
    ...(!location || Number(locationId) !== location.id ? ["Location"] : []),
    ...(!Number(chemical) ? ["Chemical"] : []),
    ...(concentration === undefined || String(concentration).trim() === "" ? ["Concentration"] : []),
    ...(amount === undefined || String(amount).trim() === "" ? ["Amount"] : []),
    ...Object.entries(errors)
      .filter(([name]) => !["location", "chemical", "concentration", "amount"].includes(name))
      .map(([, error]) => String(error?.message)),
  ];

  useEffect(() => {
    setValue("location", location?.id ?? 0);
  }, [location?.id, setValue]);

  useEffect(() => {
    // Read the current field after synchronizing a location supplied by the parent.
    const selectedLocationId = Number(getValues("location"));
    if (!selectedLocationId || selectedLocationId === location?.id) {
      return;
    }
    let active = true;
    getLocation({ id: selectedLocationId }).then((loadedLocation) => {
      if (active) setLocation(loadedLocation);
    });
    return () => {
      active = false;
    };
  }, [locationId, location?.id, setLocation, getValues]);

  const resetScannedLocation = useCallback(() => {
    setLocation(null);
    setValue("location", 0);
  }, [setLocation, setValue]);

  // Scanner: handle location QR scans
  const callbackId = useId();

  const onScanKeys = useCallback(
    (keys: string) => {
      if (scannedCodeIsLocationCode(keys)) {
        const id = extractLabelNumber(keys);
        if (id !== null) {
          setValue("location", id);
        }
        return;
      }

      if (keys.startsWith("reset-scan-location")) {
        resetScannedLocation();
      }
    },
    [setValue, resetScannedLocation]
  );

  useEffect(() => {
    removeCallbackFn(ScannedKeysType.WILD_CARD, callbackId);
    addCallbackFn(ScannedKeysType.WILD_CARD, callbackId, onScanKeys);
    return () => removeCallbackFn(ScannedKeysType.WILD_CARD, callbackId);
  }, [onScanKeys]);

  const onSubmit = async (values: Inputs) => {
    if (!location || Number(values.location) !== location.id) return;

    const existingBarcode = await listChemicalContainerExternalLabels({ qrCodeContent: barcode });
    // The qr_code_content filter is a SQL LIKE, so verify the exact match client-side
    if (existingBarcode.items.some((label) => label.qr_code_content === barcode)) {
      alert("This barcode is already registered to a container");
      return;
    }

    console.log(location);

    const container = await createChemicalContainer({
      chemical: values.chemical,
      location: location.id,
      user: values.owner.value,
      concentration: values.concentration !== undefined ? String(values.concentration) : undefined,
      amount: values.amount !== undefined ? String(values.amount) : undefined,
      amount_unit: values.amount_unit ? (values.amount_unit as ChemicalContainerAmountUnitEnum) : null,
      expire_date: values.expire_date,
    });
    setCreatedContainer(container);

    await createChemicalContainerExternalLabel({
      container: container.id,
      qr_code_content: barcode,
    });
  };

  return (
    <>
      <Form noValidate onSubmit={handleSubmit(onSubmit)}>
        <input
          type="hidden"
          {...register("location", {
            validate: (value) => (!!location && Number(value) === location.id) || "Location is required",
          })}
        />
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
              {...register("chemical", {
                required: "Chemical is required",
                validate: (value) => Number(value) > 0 || "Chemical is required",
              })}
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
                  {...register("concentration", {
                    required: "A concentration is required",
                    validate: (value) => String(value ?? "").trim() !== "" || "A concentration is required",
                  })}
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
                  {...register("amount", {
                    required: "An amount is required",
                    validate: (value) => String(value ?? "").trim() !== "" || "An amount is required",
                  })}
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
          </>
        )}

        {submitCount > 0 && missingItems.length > 0 && (
          <Alert variant="warning" className="mt-3">
            Please complete the following before registering: {missingItems.join(", ")}.
          </Alert>
        )}
        <Button type="submit" variant="primary" disabled={isSubmitting}>
          {isSubmitting && <span className="spinner-border spinner-border-sm me-1" aria-hidden="true" />}
          Register container
        </Button>
      </Form>

      {createdContainer && (
        <div className="mt-3">
          <Alert variant="success">Container registered successfully</Alert>
          <div className="d-flex justify-content-between align-items-center gap-2">
            <a
              className="btn btn-primary"
              href={`/${environment}/chemical/container/details/${createdContainer.id}/general.html`}
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
