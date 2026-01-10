import React, { useEffect, useState } from "react";
import { Button, Form, InputGroup, Modal, Toast, ToastContainer } from "react-bootstrap";
import { useFieldArray, useForm } from "react-hook-form";
import axios from "axios";
import { MonitorResultStepParameterValue } from "@jield/solodb-typescript-core";

interface FormValues {
  value: string;
}

const EditStepParameterValueModal = ({
  monitorResultStepParameterValue,
  refetchMonitorStepParameterValues,
}: {
  monitorResultStepParameterValue: MonitorResultStepParameterValue;
  refetchMonitorStepParameterValues: () => void;
}) => {
  //We need a local variable to save the form content to prevent that the information is already shown
  //on the alert even before we submit
  const [modalShow, setModalShow] = useState<boolean>(false);
  const [toastShow, setToastShow] = useState<boolean>(false);
  const [validationState, setValidationState] = useState(false);

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
      value: monitorResultStepParameterValue.value.toString(),
    },
  });

  // Watch the entire form for validation state updates
  const formValues = watch(); // Watch all field values

  // Dynamically track the validation state of the form
  useEffect(() => {
    // Update custom state for whether the form is valid based on React Hook Form's `isValid`
    setValidationState(isValid);
  }, [formValues, isValid]);

  async function updateMeasurementResult(data: FormValues) {
    await axios.patch("update/monitor/requirement/result/step-parameter-value/" + monitorResultStepParameterValue.id, {
      value: data.value,
    });

    setToastShow(true);
    setModalShow(false);

    //Refetch the results
    refetchMonitorStepParameterValues();

    //Reset the form
    reset();
  }

  async function deleteMeasurementResult() {
    await axios.delete(
      "delete/monitor/requirement/result/step-parameter-value/" + monitorResultStepParameterValue.id,
      {}
    );

    setToastShow(true);
    setModalShow(false);

    //Refetch the results
    refetchMonitorStepParameterValues();

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
      <span onClick={() => setModalShow(true)}>{monitorResultStepParameterValue.value}</span>
      <Modal show={modalShow} size={"lg"} onHide={() => setModalShow(false)}>
        <Form onSubmit={handleSubmit((data) => updateMeasurementResult(data))} validated={validationState}>
          <Modal.Header closeButton>
            <Modal.Title>Add process parameter</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Date</Form.Label>
              <Form.Control type={"text"} value={monitorResultStepParameterValue.date_created} readOnly={true} />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Module Step Parameter</Form.Label>
              <Form.Control
                type={"text"}
                value={monitorResultStepParameterValue.step_parameter.parameter.name}
                readOnly={true}
              />
            </Form.Group>

            <InputGroup hasValidation>
              <Form.Control
                type={"number"}
                step={0.01}
                required
                {...register(`value`, {
                  required: "This field is required",
                })}
              />

              {/* Display error message */}
              {errors?.value && <Form.Control.Feedback>{errors.value.message}</Form.Control.Feedback>}
            </InputGroup>
          </Modal.Body>
          <Modal.Footer>
            <Button className={"float-end"} type={"submit"} variant="primary">
              Update value
            </Button>
            <Button className={"float-end"} variant="danger" onClick={() => deleteMeasurementResult()}>
              Delete value
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

export default EditStepParameterValueModal;
