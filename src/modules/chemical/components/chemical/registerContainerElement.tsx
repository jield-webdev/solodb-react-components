import React, { useContext, useEffect, useState } from "react";
import { Alert, Button, Col, Dropdown, DropdownButton, Form, InputGroup } from "react-bootstrap";
import { Controller, useForm } from "react-hook-form";
import axios from "axios";
import LocationSelectFormElement from "@/modules/chemical/form/locationSelectFormElement";
import ChemicalSelectFormElement from "@/modules/chemical/form/chemicalSelectFormElement";
import { QRCodeSVG } from "qrcode.react";
import ChemicalContainerTypeSelectFormElement from "@/modules/chemical/form/chemicalContainerTypeSelectFormElement";
import UserFormElement from "@/modules/core/form/element/userFormElement";
import { AuthContext } from "@/modules/core/contexts/authContext";
import { useParams } from "react-router-dom";
import {
  AMOUNT_UNITS,
  extractLabelNumber,
  scannedCodeIsLocationCode,
} from "@/modules/chemical/components/chemical/registerBarcodeElement";
import { ChemicalContainer, getLocation, Room, Location } from "@jield/solodb-typescript-core";

type Inputs = {
  location: number;
  chemical: number;
  owner: {
    value: number;
    label: string;
  };
  concentration: number;
  expire_date: string;
  amount: number;
  amount_unit: string;
  container_type: number;
};

export default function RegisterContainerElement({
  room,
  resetForm,
  location,
  setLocation,
}: {
  room: Room;
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
        // Check if the code matches the pattern for scanning
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

    const response = await axios.post("create/chemical/container", values);

    //Store the created container in the state
    setCreatedContainer(response.data);
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

            <InputGroup hasValidation className={"mb-3 row"}>
              <Form.Label>Container type</Form.Label>
              <ChemicalContainerTypeSelectFormElement
                control={control}
                {...register("container_type", {
                  required: "Container type is required",
                })}
                errors={errors}
              />
              {errors.container_type && (
                <Form.Control.Feedback type="invalid">{errors.container_type.message}</Form.Control.Feedback>
              )}
            </InputGroup>

            <Form.Group className={"mb-3 w-50 w-25-sm"}>
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
                href={`${environment}/chemical/container/render/single-${createdContainer.id}.pdf`}
              >
                Print label
              </a>
            </div>

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
