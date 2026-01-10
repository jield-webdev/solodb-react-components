import React from "react";
import { Button, Form, InputGroup, Modal } from "react-bootstrap";
import axios from "axios";
import { Run } from "@jield/solodb-typescript-core";
import { HoldCode as RunHoldCode } from "@jield/solodb-typescript-core";
import { RunHoldCode as HoldCode } from "@jield/solodb-typescript-core";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import AsyncSelect from "react-select/async";

type Inputs = {
  holdCode: { value: number; label: string };
  description: string;
};

type HoldCodeResponse = {
  _embedded: {
    items: HoldCode[];
  };
  page_count: number;
  total_items: number;
  page: number;
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
          }
        : {},
      description: runHoldCode ? runHoldCode.description : "",
    },
  });
  const { errors, isSubmitting } = formState;

  const onSubmit: SubmitHandler<Inputs> = async (values: Inputs) => {
    try {
      const response = await axios.patch("update/run/hold-code/" + run.id, {
        holdcode: toggleReset ? null : values.holdCode.value,
        description: values.description,
      });
      if (response.data.hold_code) {
        setRunHoldCode(response.data);
      } else {
        setRunHoldCode(undefined);
      }

      //Always revert the toggleReset to false
      setToggleReset(false);
    } finally {
      setShow(false);
    }
  };

  const loadOptions = (inputValue: string, callback: any) => {
    axios
      .get<HoldCodeResponse>("list/run/hold-code")
      .then((response) => {
        const { data } = response;
        return data._embedded.items;
      })
      .then((holdCodes) => {
        callback(
          holdCodes.map((holdCode) => ({
            value: holdCode.id,
            label: holdCode.code,
          }))
        );
      });
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
                        return value.value !== undefined || toggleReset || "A hold code is required";
                      },
                    },
                  }}
                  render={({ field }) => (
                    <AsyncSelect
                      isSearchable={false}
                      defaultOptions
                      placeholder={"Select a hold code"}
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
            <label className={"col-sm-3 col-form-label text-end"}>Message</label>
            <div className={"col-sm-9"}>
              <Form.Control
                as="textarea"
                rows={3}
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
                setValue("description", !toggleReset ? "" : runHoldCode.description);
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
