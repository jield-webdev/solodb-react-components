import React, { useContext, useState } from "react";
import { Button, Form } from "react-bootstrap";
import { RunStepContext } from "@jield/solodb-react-components/modules/run/contexts/runStepContext";
import { useForm } from "react-hook-form";
import axios from "axios";
import { RunStep } from "@jield/solodb-typescript-core";

type Inputs = {
  remark: string;
};

export default function StepRemark({ runStep, reloadRunStep }: { runStep?: RunStep, reloadRunStep?: () => void }) {
  let setRunStep: (runStep: RunStep) => void = (() => null);

  if (!runStep) {
    runStep = useContext(RunStepContext).runStep;
    setRunStep = useContext(RunStepContext).setRunStep ?? (() => null);
  } 

  if (reloadRunStep !== undefined) {
    setRunStep = (_runStep: RunStep) => {
        reloadRunStep();
    }
  }

  if (!runStep) {
    return <>Please set RunStepContext for StepRemark</>;
  }

  const [showForm, setShowForm] = useState<boolean>(false);
  const [canUpdateRemark, setCanUpdateRemark] = useState<boolean>(!runStep.is_finished);

  const { register, handleSubmit, formState } = useForm<Inputs>({
    defaultValues: {
      remark: runStep.remark_unparsed,
    },
  });
  const { isSubmitting } = formState;

  const onSubmit = async (data: Inputs) => {
    await axios.create().patch("update/run/step/" + runStep.id, {
      remark: data.remark,
    });
    const response = await axios.get("view/run/step/" + runStep.id);
    setRunStep({
      ...runStep,
      remark: response.data.remark,
      remark_unparsed: response.data.remark_unparsed,
    });
    setShowForm(false);
  };

  if (!showForm || !canUpdateRemark) {
    return (
      <>
        <div className={"text-success"} dangerouslySetInnerHTML={{ __html: runStep.remark }} />
        {canUpdateRemark && (
          <Button variant={"primary"} className={"mt-3"} onClick={() => setShowForm(true)}>
            Edit Remark
          </Button>
        )}
      </>
    );
  }

  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      <Form.Control as="textarea" rows={6} {...register("remark")} />
      <p>
        <small className={"text-muted"}>
          If a non-conformity happens during the process, write it down in the form field below
        </small>
      </p>
      <Button variant="primary" type={"submit"} disabled={isSubmitting}>
        {isSubmitting && <span className="spinner-border spinner-border-sm me-1"></span>}
        Save remark
      </Button>
      <Button variant="secondary" className={"ms-2"} onClick={() => setShowForm(false)}>
        Cancel
      </Button>
    </Form>
  );
}
