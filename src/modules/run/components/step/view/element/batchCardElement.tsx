import React, { useState } from "react";
import { Button, Card, Form, InputGroup } from "react-bootstrap";
import { TextWithLineBreaks } from "@/utils/text";
import DateFormat from "@/modules/partial/dateFormat";
import { useForm } from "react-hook-form";
import axios from "axios";
import { Run, BatchCard } from "solodb-typescript-core";

type Inputs = {
  content: string;
};

const BatchCardElement = ({ run }: { run: Run }) => {
  const [batchCard, setBatchCard] = useState<BatchCard | undefined>(run.batch_card);
  const [showForm, setShowForm] = useState<boolean>(false);

  const { register, handleSubmit, formState, resetField } = useForm<Inputs>({
    defaultValues: {
      content: batchCard?.content,
    },
  });
  const { isSubmitting, errors } = formState;

  const onSubmit = async (data: Inputs) => {
    await axios.create().patch("update/run/batch-card/" + run.id, {
      content: data.content,
    });
    setShowForm(false);

    const response = await axios.get("view/run/" + run.id);
    setBatchCard(response.data.batch_card);
  };

  const deleteBatchCard = async (data: boolean) => {
    await axios.create().delete("delete/run/batch-card/" + run.id);
    setShowForm(false);
    setBatchCard(undefined);

    //Reset the form and remove the default values
    resetField("content");
  };

  if (!showForm) {
    if (!batchCard)
      return (
        <Button variant={"primary"} className={"mb-4"} onClick={() => setShowForm(true)}>
          Create Batch Card
        </Button>
      );

    return (
      batchCard && (
        <Card className={"rounded my-4"}>
          <Card.Body>
            <Card.Title className="text-muted">Batch card</Card.Title>
            <Card.Text>{batchCard && <span className={"text-danger fs-3"}><TextWithLineBreaks text={batchCard.content} /></span>}</Card.Text>
          </Card.Body>

          <Card.Footer className={"d-flex justify-content-between align-items-center"}>
            <div>
              Created by {batchCard.user.first_name} {batchCard.user.last_name} on{" "}
              <DateFormat format={"DD-MM-YY"}>{batchCard.date_created}</DateFormat>
              {batchCard.last_update && (
                <span>
                  {" "}
                  - Updated on <DateFormat format={"DD-MM-YY H:m"}>{batchCard.last_update}</DateFormat>
                </span>
              )}
            </div>
            <div>
              <Button variant={"primary"} size={"sm"} onClick={() => setShowForm(true)}>
                Update Batch Card
              </Button>
            </div>
          </Card.Footer>
        </Card>
      )
    );
  }

  return (
    <Form onSubmit={handleSubmit(onSubmit)} className={"mb-3"}>
      <InputGroup hasValidation>
        <Form.Control
          as="textarea"
          rows={6}
          {...register("content", { required: true })}
          isInvalid={errors.content !== undefined}
        />
        {errors.content && <Form.Control.Feedback type="invalid">This field is required</Form.Control.Feedback>}
      </InputGroup>
      <div className={"d-flex gap-2 justify-content-between mt-2"}>
        <div>
          <Button variant="primary" type={"submit"} disabled={isSubmitting}>
            {isSubmitting && <span className="spinner-border spinner-border-sm me-1"></span>}
            Save batch card
          </Button>
          <Button variant="secondary" className={"ms-2"} onClick={() => setShowForm(false)}>
            Cancel
          </Button>
        </div>
        {batchCard && (
          <div>
            <Button variant="danger" className={"ms-auto"} onClick={() => deleteBatchCard(false)}>
              Delete batch card
            </Button>
          </div>
        )}
      </div>
    </Form>
  );
};

export default BatchCardElement;
