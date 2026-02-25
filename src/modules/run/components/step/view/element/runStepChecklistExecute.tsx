import React, { useContext, useEffect, useState } from "react";
import { Alert, Button, ListGroup } from "react-bootstrap";
import { RunStepContext } from "@jield/solodb-react-components/modules/run/contexts/runStepContext";
import { useQuery } from "@tanstack/react-query";
import ChecklistItemElement from "@jield/solodb-react-components/modules/run/components/step/view/element/checklist/checklistItemElement";
import {
  finishStep,
  listRunStepChecklistItems,
  Run,
  RunStep,
  RunStepChecklistItem,
  startStep,
} from "@jield/solodb-typescript-core";
import LoadingComponent from "@jield/solodb-react-components/modules/core/components/common/LoadingComponent";

const statusMessages = {
  movingOut: "Moving out...",
  movingIn: "Moving in...",
} as const;

export default function RunStepChecklistExecute({
  run,
  runStep,
  reloadRunStep,
}: {
  run?: Run;
  runStep?: RunStep;
  reloadRunStep?: () => void;
}) {
  const { run: contextRun, runStep: contextRunStep, reloadRunStep: contextReloadRunStep } = useContext(RunStepContext);

  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const resolvedRun = run ?? contextRun;
  const resolvedRunStep = runStep ?? contextRunStep;
  const resolvedReloadRunStep = reloadRunStep ?? contextReloadRunStep ?? (() => null);

  useEffect(() => {
    if (statusMessage) {
      const timer = setTimeout(() => {
        setStatusMessage(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [statusMessage]);

  //Grab the checklist, via a tanstack query
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["checklist", resolvedRunStep?.id],
    queryFn: () => listRunStepChecklistItems({ runStep: resolvedRunStep! }),
    enabled: Boolean(resolvedRunStep),
  });

  if (!resolvedRunStep || !resolvedRun) {
    return <>Please set RunStepContext in RunStepChecklist</>;
  }

  if (resolvedRunStep.is_finished) {
    return <div>Step is finished</div>;
  }

  if (isLoading) {
    return <LoadingComponent message={"Loading..."} />;
  }

  function finishOperation(runStep: RunStep) {
    setStatusMessage(statusMessages.movingOut);
    setIsProcessing(true);
    finishStep(runStep).then(() => {
      setIsProcessing(false);
      setStatusMessage(null);
      resolvedReloadRunStep();
    });
  }

  function startOperation(runStep: RunStep) {
    setStatusMessage(statusMessages.movingIn);
    setIsProcessing(true);
    startStep(runStep).then(() => {
      setIsProcessing(false);
      setStatusMessage(null);
      resolvedReloadRunStep();
    });
  }

  return (
    <>
      {data!.items.length === 0 && <Alert variant={"info"}>No checklist found</Alert>}

      {data!.items.length > 0 && (
        <ListGroup>
          {data!.items.map((checklistItem: RunStepChecklistItem) => (
            <ChecklistItemElement checklistItem={checklistItem} refetch={refetch} key={checklistItem.id} />
          ))}
        </ListGroup>
      )}

      <div className={"d-flex justify-content-between mt-3"}>
        <div className={"d-flex gap-2 align-items-center"}>
          {resolvedRunStep.is_started ? (
            <div>
              <Button variant={"success"} onClick={() => finishOperation(resolvedRunStep)} disabled={isProcessing}>
                {statusMessage !== null ? statusMessage : "Move out"}
              </Button>
            </div>
          ) : (
            <div>
              <Button variant={"success"} onClick={() => startOperation(resolvedRunStep)} disabled={isProcessing}>
                {statusMessage !== null ? statusMessage : "Start processing"}
              </Button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
