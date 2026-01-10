import React, { useEffect, useState } from "react";
import { Button, Form, InputGroup, Modal, Toast, ToastContainer } from "react-bootstrap";
import { useFieldArray, useForm } from "react-hook-form";
import axios from "axios";
import { MonitorRequirement, MonitorRequirementTarget } from "@jield/solodb-typescript-core";

interface ResultField {
  id: number;
  label: string;
  logging_parameter_id: number;
  value: string;
}

interface FormValues {
  date: string;
  results: ResultField[];
}

// Generate today's date in 'yyyy-MM-dd' format
const today = new Date().toISOString().split("T")[0];

const AddResultModal = ({
  requirement,
  targets,
  refetchResults,
}: {
  requirement: MonitorRequirement;
  targets: MonitorRequirementTarget[];
  refetchResults: () => void;
}) => {
  //We need a local variable to save the form content to prevent that the information is already shown
  //on the alert even before we submit
  const [modalShow, setModalShow] = useState<boolean>(false);
  const [toastShow, setToastShow] = useState<boolean>(false);
  const [validationState, setValidationState] = useState(false);

  //Use a field Array to create the form for the manual results
  //This will be used to create the form for the manual results
  const {
    control,
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isValid },
  } = useForm<FormValues>({
    defaultValues: {
      date: today,
    },
  });
  const { fields, append, remove } = useFieldArray({
    control,
    name: "results",
    rules: { required: true },
  });

  useEffect(() => {
    remove();

    targets.forEach((target) => {
      append({
        id: target.id,
        label: target.logging_parameter.name,
        logging_parameter_id: target.logging_parameter.id,
        value: "",
      });
    });
  }, [targets]);

  // Watch the entire form for validation state updates
  const formValues = watch(); // Watch all field values

  // Dynamically track the validation state of the form
  useEffect(() => {
    // Update custom state for whether the form is valid based on React Hook Form's `isValid`
    setValidationState(isValid);
  }, [formValues, isValid]);

  async function saveMeasurementResult(data: FormValues) {
    await axios.post("create/monitor/requirement/result", {
      requirement: requirement.id,
      date: data.date,
      values: data.results,
    });

    setToastShow(true);
    setModalShow(false);

    //Refetch the results
    refetchResults();

    //Reset the form
    reset();
  }

  function NotificationToast() {
    return (
      <ToastContainer position="top-end" className="p-3">
        <Toast onClose={() => setToastShow(false)} show={toastShow} delay={3000} autohide bg={"light"}>
          <Toast.Header>
            <strong className="me-auto">Results saved</strong>
            <small>Just now</small>
          </Toast.Header>
          <Toast.Body>Measurement results were saved successfully</Toast.Body>
        </Toast>
      </ToastContainer>
    );
  }

  return (
    <>
      <Button variant="primary" onClick={() => setModalShow(true)}>
        Add manual result
      </Button>
      <Modal show={modalShow} size={"lg"} onHide={() => setModalShow(false)}>
        <Form onSubmit={handleSubmit((data) => saveMeasurementResult(data))} validated={validationState}>
          <Modal.Header closeButton>
            <Modal.Title>Add manual result</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Date</Form.Label>
              <Form.Control
                type={"date"}
                key={"date"}
                placeholder={"Date"}
                required
                {...register(`date`, {
                  required: "This field is required",
                })}
              />
              {errors.date && <Form.Control.Feedback>{errors.date.message}</Form.Control.Feedback>}
            </Form.Group>

            {fields.map((field, index) => {
              return (
                <Form.Group className="mb-3" key={index}>
                  <Form.Label>{field.label}</Form.Label>
                  <InputGroup hasValidation>
                    <Form.Control
                      type={"number"}
                      step={0.01}
                      key={field.id}
                      placeholder={field.label}
                      required
                      {...register(`results.${index}.value`, {
                        required: "This field is required",
                      })}
                    />

                    {/* Display error message */}
                    {errors?.results?.[index]?.value && (
                      <Form.Control.Feedback>{errors.results[index].value.message}</Form.Control.Feedback>
                    )}
                  </InputGroup>
                </Form.Group>
              );
            })}
          </Modal.Body>
          <Modal.Footer>
            <Button className={"float-end"} type={"submit"} variant="primary">
              Add manual result
            </Button>
            <Button
              className={"float-end"}
              variant="secondary"
              onClick={() => {
                reset(); //Reset the form
                setModalShow(false); //Close the modal
              }}
            >
              Close
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
      <NotificationToast />
    </>
  );
};

export default AddResultModal;
