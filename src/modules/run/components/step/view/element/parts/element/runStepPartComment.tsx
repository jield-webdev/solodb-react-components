import { useForm } from "react-hook-form";
import axios from "axios";
import { useState } from "react";
import { Button, Form } from "react-bootstrap";
import { RunStepPart } from "solodb-typescript-core";

type Inputs = {
  comment: string | null;
};

const RunStepPartComment = ({
  runStepPart,
  setRunStepPart,
  editable = true,
}: {
  runStepPart: RunStepPart;
  setRunStepPart: (runStepPart: RunStepPart) => void;
  editable?: boolean;
}) => {
  const [showForm, setShowForm] = useState<boolean>(false);
  const [comment, setComment] = useState<string | null>(runStepPart.comment);

  const { register, handleSubmit, formState, resetField } = useForm<Inputs>({
    defaultValues: {
      comment: comment,
    },
  });
  const { isSubmitting, errors } = formState;

  const onSubmit = async (data: Inputs) => {
    await axios
      .create()
      .patch("update/run/step/part/" + runStepPart.id, {
        comment: data.comment,
      })
      .then((response) => {
        setRunStepPart({
          ...runStepPart,
          ...{ comment: response.data.comment },
        });
        setComment(response.data.comment);
        setShowForm(false);
      });
  };

  if (!editable) {
    return <div>{comment}</div>;
  }

  if (!showForm) {
    if (comment === null) {
      return (
        <Button variant={"link"} size={"sm"} className={"p-0 text-muted"} onClick={() => setShowForm(true)}>
          Add comment
        </Button>
      );
    }

    return (
      <div className={"d-flex align-items-start gap-2"}>
        <div className={"text-break"}>{comment}</div>
        <Button
          variant={"link"}
          size={"sm"}
          className={"p-0 text-muted"}
          onClick={() => setShowForm(true)}
        >
          Edit
        </Button>
      </div>
    );
  }

  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      <Form.Group className="mb-3" controlId="formBasicEmail">
        <Form.Control as={"textarea"} {...register("comment")} />
      </Form.Group>
      <Button size={"sm"} type="submit" disabled={isSubmitting}>
        Save
      </Button>
      <Button variant={"warning"} size={"sm"} className={"ms-2"} onClick={() => setShowForm(false)}>
        Cancel
      </Button>
    </Form>
  );
};

export default RunStepPartComment;
