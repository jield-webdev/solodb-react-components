import React, { useState } from "react";
import { Button, Card, Form, InputGroup } from "react-bootstrap";
import { TextWithLineBreaks } from "@jield/solodb-react-components/utils/text";
import DateFormat from "@jield/solodb-react-components/modules/partial/dateFormat";
import { useForm } from "react-hook-form";
import axios from "axios";
import { Run, BatchCard } from "@jield/solodb-typescript-core";

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

  const deleteBatchCard = async () => {
    await axios.create().delete("delete/run/batch-card/" + run.id);
    setShowForm(false);
    setBatchCard(undefined);

    //Reset the form and remove the default values
    resetField("content");
  };

  if (!showForm) {
    if (!batchCard)
      return (
        <Button variant="outline-primary" className="mb-4" onClick={() => setShowForm(true)}>
          Create Batch Card
        </Button>
      );

    return (
      batchCard && (
        <Card className="rounded my-4 shadow-sm border-0">
          <Card.Body>
            <div className="d-flex align-items-start justify-content-between gap-3">
              <Card.Title className="text-danger mb-0">Batch card</Card.Title>
              <Button
                variant="outline-primary"
                size="sm"
                className="text-nowrap"
                onClick={() => setShowForm(true)}
              >
                Update batch card
              </Button>
            </div>
            <Card.Text className="mt-3 mb-2 fs-5 text-body">
              {batchCard && <TextWithLineBreaks text={batchCard.content} />}
            </Card.Text>
          </Card.Body>

          <Card.Footer className="bg-transparent border-0 pt-0 pb-3">
            <div className="text-muted small">
              Created <DateFormat format="DD-MM-YY">{batchCard.date_created}</DateFormat> by{" "}
              {batchCard.user.first_name} {batchCard.user.last_name}
              {batchCard.last_update && (
                <span>
                  {" ("}
                  Updated <DateFormat format="DD-MM-YY H:m">{batchCard.last_update}</DateFormat>
                  {")"}
                </span>
              )}
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
      <div className="d-flex flex-column flex-md-row gap-2 justify-content-between mt-2">
        <div className="d-flex flex-wrap gap-2">
          <Button variant="primary" type="submit" disabled={isSubmitting} className="text-nowrap">
            {isSubmitting && <span className="spinner-border spinner-border-sm me-1"></span>}
            Save batch card
          </Button>
          <Button variant="secondary" onClick={() => setShowForm(false)}>
            Cancel
          </Button>
        </div>
        {batchCard && (
          <div>
            <Button variant="outline-danger" className="text-nowrap" onClick={deleteBatchCard}>
              Delete batch card
            </Button>
          </div>
        )}
      </div>
    </Form>
  );
};

export default BatchCardElement;
