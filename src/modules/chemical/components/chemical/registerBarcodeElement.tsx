import React, { useContext, useEffect, useState } from "react";
import { Alert, Button, Col, Dropdown, DropdownButton, Form, InputGroup } from "react-bootstrap";
import { Controller, useForm } from "react-hook-form";
import axios from "axios";
import LocationSelectFormElement from "@/modules/chemical/form/locationSelectFormElement";
import ChemicalSelectFormElement from "@/modules/chemical/form/chemicalSelectFormElement";
import { QRCodeSVG } from "qrcode.react";
import UserFormElement from "@/modules/core/form/element/userFormElement";
import { AuthContext } from "@/modules/core/contexts/authContext";
import { useParams } from "react-router-dom";
import { ChemicalContainer, getLocation, Room, Location, listChemicalContainerExternalLabels } from "@jield/solodb-typescript-core";

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

/**
 * Checks if a string ends with "/l/" followed by an integer
 * @param {string} url - The URL to check
 * @returns {boolean} - True if the URL ends with "/l/" followed by an integer, false otherwise
 */
export function scannedCodeIsLocationCode(url: string): boolean {
  // This regex checks if the string ends with "/l/" followed by one or more digits
  const regex = /\/l\/\d+$/;
  return regex.test(url);
}

/**
 * Extracts the label number if the URL ends with "/l/" followed by an integer
 * @param {string} url - The URL to check
 * @returns {number|null} - The extracted number or null if pattern doesn't match
 */
export function extractLabelNumber(url: string): number | null {
  const match = url.match(/\/l\/(\d+)$/);
  return match ? parseInt(match[1], 10) : null;
}

// Add this constant to your component file (outside the component function)
export const AMOUNT_UNITS = [
  { value: "g", label: "Gram" },
  { value: "kg", label: "Kilogram" },
  { value: "lb", label: "US pound" },
  { value: "mc", label: "Microgram" },
  { value: "mg", label: "Milligram" },
  { value: "oz", label: "Ounce" },
  { value: "to", label: "Tonnes" },
  { value: "ton", label: "US ton" },
  { value: '"3', label: "Cubic inch" },
  { value: "ccm", label: "Cubic centimeter" },
  { value: "cl", label: "Centiliter" },
  { value: "dm3", label: "Cubic decimeter" },
  { value: "foz", label: "Fluid Ounce Us" },
  { value: "ft3", label: "Cubic foot" },
  { value: "gal", label: "US gallon" },
  { value: "hl", label: "Hectoliter" },
  { value: "kit", label: "Kit" },
  { value: "l", label: "Liter" },
  { value: "m3", label: "Cubic meter" },
  { value: "ml", label: "Mililiter" },
  { value: "mm3", label: "Cubic milimeter" },
  { value: "pc", label: "Item" },
  { value: "pce", label: "Piece" },
  { value: "pt", label: "Pint, US liquid" },
  { value: "qt", label: "Quart, US liquid" },
  { value: "yd3", label: "Cubic Yard" },
  { value: "µl", label: "Microliter" },
].sort((a, b) => a.label.localeCompare(b.label));

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

  //Keep a state for the location, because we need to change the behavior of the form in case a location has been scanned
  // const [scannedLocation, setScannedLocation] = useState<Location | null>(location);
  const [createdContainer, setCreatedContainer] = useState<ChemicalContainer | null>(null);

  let currentDate = new Date();
  currentDate.setFullYear(currentDate.getFullYear() + 5);

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<Inputs>({
    defaultValues: {
      expire_date: currentDate.toISOString().split("T")[0],
      owner: {
        value: user?.id,
        label: user?.full_name,
      },
    },
  });

  const locationId = watch("location");

  useEffect(() => {
    if (!locationId) {
      return;
    }
    //We have a location, call the API to find all information about it
    getLocation({ id: locationId }).then((location) => {
      setLocation(location);
    });
  }, [locationId]);

  useEffect(() => {
    let scannedCode = ""; // To accumulate scanner input

    const handleKeyDown = (event: KeyboardEvent) => {
      // Ignore inputs coming from physical keyboard if barcode scanner is exclusively expected
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return; // Ignore if the user is typing into a form field or textarea
      }

      // Ignore modifier keys like Shift, Ctrl, Alt, etc., as well as irrelevant keys
      if (event.key.length > 1 && event.key !== "Enter") {
        return;
      }

      // Append valid characters to the accumulated "scannedCode"
      if (event.key === "Enter") {
        // Check if the scanned code ends with /l/<number>

        if (scannedCodeIsLocationCode(scannedCode)) {
          const locationId = extractLabelNumber(scannedCode);
          if (null !== locationId) {
            //We have a location, call the API to find all information about it
            getLocation({ id: locationId }).then((location) => {
              setLocation(location);
            });

            setValue("location", locationId); // Update the "location" field with the parsed ID
          }
        }

        if (scannedCode.startsWith("reset-scan-location")) {
          resetScannedLocation();
        }
        scannedCode = ""; // Reset after processing
      } else {
        scannedCode += event.key; // Accumulate characters
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [setValue]);

  const onSubmit = async (values: Inputs) => {
    //Append the user to the submission values, make sure the object accepts the new property
    (values as any).user = values.owner.value;

    //First check if we already have a container with this barcode (should not be the case)
    const existingBarcode = await listChemicalContainerExternalLabels({
      qrCodeContent: barcode,
    });

    if (existingBarcode.items.length > 0) {
      alert("This barcode is already registered to a container");
      return;
    }

    const response = await axios.post("create/chemical/container", values);

    //Store the created container in the state
    setCreatedContainer(response.data);

    //We also need to register the barcode with the container
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
        {!location && <LocationSelectFormElement room={room} control={control} name={"location"} />}

        {location && (
          <Form.Group className={"mb-3"}>
            <Form.Label>Scanned location</Form.Label>
            <Col>
              <div className={"d-flex justify-content-between"}>
                <span className={"h1"}>{location.name}</span>

                <div className={"d-flex flex-column"}>
                  <QRCodeSVG value={"reset-scan-location"} size={100} onClick={() => resetScannedLocation()} />
                  <span className={"text-muted"}>Reset location</span>
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
              })}
            />

            <Form.Group className={"mb-3"}>
              <Form.Label>Owner</Form.Label>
              <UserFormElement
                control={control}
                {...register("owner", {
                  required: "Owner is required",
                })}
                name={"owner"}
              />
            </Form.Group>

            <Form.Group className={"mb-3"}>
              <Form.Label>Concentration</Form.Label>
              <InputGroup className="mb-3 w-25" hasValidation>
                <Form.Control
                  as="input"
                  {...register("concentration", {
                    required: "An concentration is required",
                  })}
                  isInvalid={errors.concentration !== undefined}
                ></Form.Control>

                {errors.concentration && (
                  <Form.Control.Feedback type="invalid">{errors.concentration.message}</Form.Control.Feedback>
                )}
              </InputGroup>
            </Form.Group>

            <Form.Group className={"mb-3"}>
              <Form.Label>Amount</Form.Label>
              <InputGroup className="mb-3 w-25" hasValidation>
                <Form.Control
                  as="input"
                  {...register("amount", {
                    required: "An amount is required",
                  })}
                  isInvalid={errors.amount !== undefined}
                ></Form.Control>

                <Controller
                  name="amount_unit"
                  control={control}
                  render={({ field }) => (
                    <DropdownButton
                      id="input-group-dropdown-1"
                      title={field.value || "(no unit)"}
                      onSelect={(eventKey) => field.onChange(eventKey)}
                    >
                      {/*Add an empty option*/}
                      <Dropdown.Item key={0} eventKey={""}>
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

            <Form.Group className={"mb-3"}>
              <Form.Label>Expire date</Form.Label>
              <Form.Control
                type="date"
                {...register("expire_date", {
                  required: "An expire date is required",
                })}
                isInvalid={errors.expire_date !== undefined}
              ></Form.Control>
              {errors.expire_date && (
                <Form.Control.Feedback type="invalid">{errors.expire_date.message}</Form.Control.Feedback>
              )}
            </Form.Group>

            <Button type="submit" variant={"primary"} disabled={isSubmitting}>
              {isSubmitting && <span className="spinner-border spinner-border-sm me-1"></span>}
              Register container
            </Button>
          </>
        )}
      </Form>

      {createdContainer && (
        <div className={"mt-3"}>
          <Alert variant={"success"}>Container registered successfully</Alert>

          <div className={"d-flex justify-content-between align-items-center gap-2"}>
            <div>
              <a
                className={"btn btn-primary"}
                href={`${environment}/chemical/container/details/${createdContainer.id}/general.html`}
              >
                Go to container
              </a>
            </div>

            <QRCodeSVG value={"reset-form"} size={100} className={"float-end"} onClick={() => resetForm()} />
          </div>
        </div>
      )}
    </>
  );
}
