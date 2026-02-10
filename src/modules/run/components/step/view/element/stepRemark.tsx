import React, { useCallback, useContext, useEffect, useState } from "react";
import { Button, Form } from "react-bootstrap";
import { RunStepContext } from "@jield/solodb-react-components/modules/run/contexts/runStepContext";
import { useForm } from "react-hook-form";
import axios from "axios";
import { RunStep } from "@jield/solodb-typescript-core";

type Inputs = {
  remark: string;
};

type StepRemarkProps = {
  runStep?: RunStep;
  reloadRunStep?: () => void;
  title?: string;
  titleClassName?: string;
};

const noopSetRunStep: (nextRunStep: RunStep) => void = () => undefined;

export default function StepRemark({
  runStep,
  reloadRunStep,
  title = "Remark",
  titleClassName = "mb-2 text-start",
}: StepRemarkProps) {
  const { runStep: contextRunStep, setRunStep: contextSetRunStep } = useContext(RunStepContext);
  const resolvedRunStep = runStep ?? contextRunStep;

  const setRunStep: (nextRunStep: RunStep) => void = reloadRunStep
    ? () => reloadRunStep()
    : runStep
      ? noopSetRunStep
      : (contextSetRunStep ?? noopSetRunStep);

  const [showForm, setShowForm] = useState(false);

  if (!resolvedRunStep) {
    return <>Please set RunStepContext for StepRemark</>;
  }

  const canUpdateRemark = !resolvedRunStep.is_finished;
  const hasRemark = Boolean(resolvedRunStep.remark?.trim());

  const { register, handleSubmit, formState, reset } = useForm<Inputs>({
    defaultValues: {
      remark: resolvedRunStep.remark_unparsed ?? "",
    },
  });
  const { isSubmitting } = formState;

  useEffect(() => {
    reset({ remark: resolvedRunStep.remark_unparsed ?? "" });
  }, [reset, resolvedRunStep.remark_unparsed]);

  const onSubmit = useCallback(
    async (data: Inputs) => {
      await axios.patch("update/run/step/" + resolvedRunStep.id, {
        remark: data.remark,
      });
      const response = await axios.get("view/run/step/" + resolvedRunStep.id);
      setRunStep({
        ...resolvedRunStep,
        remark: response.data.remark,
        remark_unparsed: response.data.remark_unparsed,
      });
      setShowForm(false);
    },
    [resolvedRunStep, setRunStep]
  );

  if (!showForm || !canUpdateRemark) {
    return (
      <>
        <div className="d-flex align-items-center gap-2">
          <h3 className={titleClassName}>{title}</h3>
          {!hasRemark && canUpdateRemark && (
            <Button variant="primary" className="ms-auto" size="sm" onClick={() => setShowForm(true)}>
              Add remark
            </Button>
          )}
        </div>
        {hasRemark && <div className="text-success" dangerouslySetInnerHTML={{ __html: resolvedRunStep.remark }} />}
        {!hasRemark && <small className="text-muted">No remark.</small>}
        {hasRemark && canUpdateRemark && (
          <Button variant="primary" className="mt-3" onClick={() => setShowForm(true)}>
            Edit remark
          </Button>
        )}
      </>
    );
  }

  return (
    <>
      <h3 className={titleClassName}>{title}</h3>
      <Form onSubmit={handleSubmit(onSubmit)}>
        <Form.Control as="textarea" rows={6} {...register("remark")} />
        <p>
          <small className="text-muted">If a non-conformity happens, note it here</small>
        </p>
        <Button variant="primary" type="submit" disabled={isSubmitting}>
          {isSubmitting && <span className="spinner-border spinner-border-sm me-1"></span>}
          Save remark
        </Button>
        <Button variant="secondary" className="ms-2" onClick={() => setShowForm(false)}>
          Cancel
        </Button>
      </Form>
    </>
  );
}
