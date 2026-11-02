import React, { useState } from "react";
import { Alert, Button, Form, InputGroup, Modal } from "react-bootstrap";
import { SubmitHandler, useForm } from "react-hook-form";
import {
  Chemical,
  ChemicalPhysicalStateEnum,
  ChemicalStandardProductEnum,
  createChemical,
} from "@jield/solodb-typescript-core";

//Infer the types from the Chemical interface
type Inputs = Omit<Chemical, "id"> & { description?: string };

const CreateChemicalModal = ({
  show,
  setShow,
  onChemicalCreate,
}: {
  show: boolean;
  setShow: (set: boolean) => void;
  onChemicalCreate: (chemical: Chemical) => void;
}) => {
  const {
    register,
    control,
    setValue,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Inputs>({
    defaultValues: {},
  });

  const [submitError, setSubmitError] = useState<string | null>(null);

  const onSubmit: SubmitHandler<Inputs> = async (values: Inputs) => {
    setSubmitError(null);
    try {
      const chemical = await createChemical({
        name: values.name,
        cas_number: values.cas_number ?? undefined,
        description: values.description || undefined,
        standard_product: Number(values.standard_product) as ChemicalStandardProductEnum,
        physical_state: Number(values.physical_state) as ChemicalPhysicalStateEnum,
      });

      //Pass the created chemical to the parent component
      onChemicalCreate(chemical);
      setShow(false);
    } catch (e) {
      console.error("Error creating chemical:", e);
      setSubmitError("Could not create the chemical. Please check the values and try again.");
    }
  };

  return (
    <Modal show={show} size={"lg"} onHide={() => setShow(false)}>
      <Form onSubmit={handleSubmit(onSubmit)}>
        <Modal.Header closeButton>
          <Modal.Title>Create new chemical</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {submitError && <Alert variant="danger">{submitError}</Alert>}
          <InputGroup hasValidation className={"mb-3 row"}>
            <label htmlFor={"cas_number"} className={"col-sm-3 col-form-label text-end"}>
              CAS Number
            </label>
            <div className={"col-sm-9"}>
              <Form.Control
                as="input"
                id={"cas_number"}
                {...register("cas_number", {
                  required: "A cas number is required",
                })}
                isInvalid={errors.cas_number !== undefined}
              ></Form.Control>
              {errors.cas_number && (
                <Form.Control.Feedback type="invalid">{errors.cas_number.message}</Form.Control.Feedback>
              )}
            </div>
          </InputGroup>

          <InputGroup hasValidation className={"mb-3 row"}>
            <label htmlFor={"name"} className={"col-sm-3 col-form-label text-end"}>
              Name
            </label>
            <div className={"col-sm-9"}>
              <Form.Control
                as="input"
                id={"name"}
                {...register("name", {
                  required: "A name is required",
                })}
                isInvalid={errors.name !== undefined}
              ></Form.Control>
              {errors.name && <Form.Control.Feedback type="invalid">{errors.name.message}</Form.Control.Feedback>}
            </div>
          </InputGroup>

          <InputGroup hasValidation className={"mb-3 row"}>
            <label htmlFor={"description"} className={"col-sm-3 col-form-label text-end"}>
              Description
            </label>
            <div className={"col-sm-9"}>
              <Form.Control as="textarea" rows={3} id={"description"} {...register("description")}></Form.Control>
              {errors.description && (
                <Form.Control.Feedback type="invalid">{errors.description.message}</Form.Control.Feedback>
              )}
            </div>
          </InputGroup>
          <InputGroup hasValidation className={"mb-3 row"}>
            <label htmlFor={"standard_product"} className={"col-sm-3 col-form-label text-end"}>
              Standard product
            </label>
            <div className={"col-sm-9"}>
              <Form.Select
                id={"standard_product"}
                {...register("standard_product", {
                  required: "A standard product is required",
                })}
                isInvalid={errors.standard_product !== undefined}
              >
                <option value={ChemicalStandardProductEnum.NON_STANDARD_PRODUCT}>Non standard product</option>
                <option value={ChemicalStandardProductEnum.STANDARD_PRODUCT}>Standard product</option>
              </Form.Select>
              {errors.standard_product && (
                <Form.Control.Feedback type="invalid">{errors.standard_product.message}</Form.Control.Feedback>
              )}
            </div>
          </InputGroup>
          <InputGroup hasValidation className={"mb-3 row"}>
            <label htmlFor={"physical_state"} className={"col-sm-3 col-form-label text-end"}>
              Physical state
            </label>
            <div className={"col-sm-9"}>
              <Form.Select
                id={"physical_state"}
                {...register("physical_state", {
                  required: "A physical state is required",
                })}
                isInvalid={errors.physical_state !== undefined}
              >
                <option value={ChemicalPhysicalStateEnum.SOLID}>Solid</option>
                <option value={ChemicalPhysicalStateEnum.LIQUID}>Liquid</option>
                <option value={ChemicalPhysicalStateEnum.GAS}>Gas</option>
                <option value={ChemicalPhysicalStateEnum.OTHER}>Other</option>
              </Form.Select>
              {errors.physical_state && (
                <Form.Control.Feedback type="invalid">{errors.physical_state.message}</Form.Control.Feedback>
              )}
            </div>
          </InputGroup>
        </Modal.Body>
        <Modal.Footer>
          <Button variant={"primary"} disabled={isSubmitting} onClick={() => handleSubmit(onSubmit)()}>
            {isSubmitting && <span className="spinner-border spinner-border-sm me-1"></span>}
            Create new chemical
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default CreateChemicalModal;
