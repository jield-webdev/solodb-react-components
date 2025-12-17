import React, { useEffect, useState } from "react";
import { Button, Form, InputGroup, Modal, Toast, ToastContainer } from "react-bootstrap";
import { useForm } from "react-hook-form";
import axios from "axios";
import { MonitorRequirement, MonitorMeasurementResult, MonitorStepParameter, listEquipmentModuleParameters, listMonitorRequirementResultMonitorStepParameterValues, listMonitorStepParameters } from "solodb-typescript-core";

interface FormValues {
  id: number;
  module_step_parameter_id: number;
  value: string;
}

const AddStepParameterValueModal = ({
  requirement,
  result,
  refetchMonitorStepParameterValues,
}: {
  requirement: MonitorRequirement;
  result: MonitorMeasurementResult;
  refetchMonitorStepParameterValues: () => void;
}) => {
  //We need a local variable to save the form content to prevent that the information is already shown
  //on the alert even before we submit
  const [modalShow, setModalShow] = useState<boolean>(false);
  const [toastShow, setToastShow] = useState<boolean>(false);
  const [validationState, setValidationState] = useState(false);
  const [monitorStepParameters, setMonitorStepParameters] = useState<MonitorStepParameter[]>([]);

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
    defaultValues: {},
  });

  useEffect(() => {
    async function populate() {
      //We have to know with monitor step parameters are available for this requirement, and which have been already chosen
      const monitorStepParameterValues = await listMonitorRequirementResultMonitorStepParameterValues({
        result: result,
      });

      const response = await listMonitorStepParameters({
        requirement: requirement,
      });
      //Fetch also all the parameters from the equipment, we have to filter on them, and only show these who are selected on the tool
      const equipmentModuleParameters = await listEquipmentModuleParameters({
        module: requirement.step.process_module.module,
      });

      //The response items can have no overlap with the parameters in the monitorStepParameterValues items
      //We have to filter out the parameters that are already chosen
      response.items = response.items.filter(
        (item) => !monitorStepParameterValues.items.map((value) => value.step_parameter.id).includes(item.id)
      );

      //We keep the items which are also int he equipmentModuleParameters
      response.items = response.items.filter((item) =>
        equipmentModuleParameters.items.map((value) => value.parameter.id).includes(item.parameter.id)
      );

      setMonitorStepParameters(response.items);
    }

    //Only run this function when the modal is shown
    if (modalShow) {
      populate();
    }
  }, [modalShow]);

  // Watch the entire form for validation state updates
  const formValues = watch(); // Watch all field values

  // Dynamically track the validation state of the form
  useEffect(() => {
    // Update custom state for whether the form is valid based on React Hook Form's `isValid`
    setValidationState(isValid);
  }, [formValues, isValid]);

  async function saveMeasurementResult(data: FormValues) {
    await axios.post("create/monitor/requirement/result/step-parameter-value", {
      result: result.id,
      step_parameter: data.module_step_parameter_id,
      value: data.value,
    });

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
      <Button variant="primary" size={"sm"} onClick={() => setModalShow(true)}>
        +
      </Button>
      <Modal show={modalShow} size={"lg"} onHide={() => setModalShow(false)}>
        <Form onSubmit={handleSubmit((data) => saveMeasurementResult(data))} validated={validationState}>
          <Modal.Header closeButton>
            <Modal.Title>Add process parameter</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Date</Form.Label>
              <Form.Control type={"text"} value={result.date_created} readOnly={true} />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Module Step Parameter</Form.Label>
              <Form.Select
                {...register("module_step_parameter_id", {
                  required: true,
                })}
              >
                <option value="">— Select a parameter</option>
                {monitorStepParameters.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.parameter.name}
                  </option>
                ))}
              </Form.Select>
              <Form.Text className="text-muted">
                Only parameters are shown here which are active on the Equipment Module and in the monitor step. In case
                parameters are missing you should replace the process in the monitor with the same process from the
                process library to reload the parameters
              </Form.Text>
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

export default AddStepParameterValueModal;
