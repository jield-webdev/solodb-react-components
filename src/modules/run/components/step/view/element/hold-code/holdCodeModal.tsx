import React from "react";
import { Button, Form, InputGroup, Modal } from "react-bootstrap";
import {
  HoldCode as RunHoldCode,
  listRunHoldCodes,
  Run,
  RunHoldCode as HoldCode,
  updateRunHoldCode,
} from "@jield/solodb-typescript-core";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import AsyncSelect from "react-select/async";

type HoldCodeOption = { value: number; label: string; holdCode: HoldCode };

type Inputs = {
  holdCode: HoldCodeOption | null;
  description: string;
};

const loadOptions = (inputValue: string, callback: (options: HoldCodeOption[]) => void) => {
  listRunHoldCodes({ pageSize: 1000 })
    .then((response) => {
      callback(
        response.items.map((holdCode) => ({
          value: holdCode.id,
          label: holdCode.code,
          holdCode,
        }))
      );
    })
    .catch((error) => {
      console.error("Failed to load hold codes.", error);
      callback([]);
    });
};

const HoldCodeModal = ({
  run,
  show,
  setShow,
  runHoldCode,
  setRunHoldCode,
}: {
  run: Run;
  show: boolean;
  setShow: (set: boolean) => void;
  runHoldCode?: RunHoldCode;
  setRunHoldCode: (runHoldCode?: RunHoldCode) => void;
}) => {
  const [toggleReset, setToggleReset] = React.useState<boolean>(false);

  const { register, control, setValue, handleSubmit, formState } = useForm<Inputs>({
    defaultValues: {
      holdCode: runHoldCode
        ? {
            value: runHoldCode.hold_code.id,
            label: runHoldCode.hold_code.code,
            holdCode: runHoldCode.hold_code,
          }
        : null,
      description: runHoldCode?.description ?? "",
    },
  });
  const { errors, isSubmitting } = formState;

  const onSubmit: SubmitHandler<Inputs> = async (values: Inputs) => {
    try {
      const response = await updateRunHoldCode({
        run,
        holdCode: toggleReset ? null : (values.holdCode?.holdCode ?? null),
        description: values.description,
      });
      if (!Array.isArray(response) && response.hold_code) {
        // The API only returns the hold code and description, matching what the badge needs.
        setRunHoldCode(response as unknown as RunHoldCode);
      } else {
        setRunHoldCode(undefined);
      }

      //Always revert the toggleReset to false
      setToggleReset(false);
    } finally {
      setShow(false);
    }
  };

  return (
    <Modal show={show} size={"lg"} onHide={() => setShow(false)}>
      <Form onSubmit={handleSubmit(onSubmit)}>
        <Modal.Header closeButton>
          <Modal.Title>{toggleReset ? "Reset hold code" : "Update hold code"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {!toggleReset && (
            <InputGroup hasValidation className={"mb-3 row"}>
              <Form.Label className={"col-sm-3 col-form-label text-end"}>Hold code</Form.Label>
              <div className={"col-sm-9"}>
                <Controller
                  name="holdCode"
                  control={control}
                  rules={{
                    validate: {
                      required: (value) => {
                        return value !== null || toggleReset || "A hold code is required";
                      },
                    },
                  }}
                  render={({ field }) => (
                    <AsyncSelect
                      isSearchable={false}
                      defaultOptions
                      placeholder={"— Select a hold code"}
                      loadOptions={loadOptions}
                      value={field.value}
                      onChange={(e) => {
                        field.onChange(e);
                      }}
                    />
                  )}
                />
                {errors.holdCode && <span className={"text-danger"}>{errors.holdCode.message}</span>}
              </div>
            </InputGroup>
          )}

          <InputGroup hasValidation className={"mb-3 row"}>
            <label htmlFor={"holdCodeDescription"} className={"col-sm-3 col-form-label text-end"}>
              Message
            </label>
            <div className={"col-sm-9"}>
              <Form.Control
                as="textarea"
                rows={3}
                id={"holdCodeDescription"}
                {...register("description", {
                  required: "A message is required",
                })}
                isInvalid={errors.description !== undefined}
              ></Form.Control>
              {errors.description && (
                <Form.Control.Feedback type="invalid">{errors.description.message}</Form.Control.Feedback>
              )}
            </div>
          </InputGroup>
        </Modal.Body>
        <Modal.Footer>
          <Button type="submit" variant={toggleReset ? "success" : "primary"} disabled={isSubmitting}>
            {isSubmitting && <span className="spinner-border spinner-border-sm me-1"></span>}
            {toggleReset ? "Release lot" : "Update Hold code"}
          </Button>
          {runHoldCode && (
            <Button
              variant="outline-danger"
              onClick={() => {
                //Remove the default value of the description
                setValue("description", !toggleReset ? "" : (runHoldCode.description ?? ""));
                setToggleReset(!toggleReset);
              }}
            >
              {toggleReset ? "Update hold Code" : "Reset hold code"}
            </Button>
          )}
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default HoldCodeModal;
