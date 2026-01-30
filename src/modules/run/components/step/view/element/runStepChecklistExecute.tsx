import React, { useContext, useRef, useState, useEffect } from "react";
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
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  useEffect(() => {
    if (statusMessage) {
      const timer = setTimeout(() => {
        setStatusMessage(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [statusMessage]);

  if (!run) {
    run = useContext(RunStepContext).run;
  }
  if (!runStep) {
    runStep = useContext(RunStepContext).runStep;
  }

  const contextReloadFn = useContext(RunStepContext).reloadRunStep;
  if (!reloadRunStep) {
    reloadRunStep = contextReloadFn ?? (() => null);
  }

  if (!runStep || !reloadRunStep || !run) {
    return <>Please set RunStepContext in RunStepChecklist</>;
  }

  //Grab the checklist, via a tanstack query
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["checklist", runStep.id],
    queryFn: () => listRunStepChecklistItems({ runStep: runStep }),
  });

  // TODO: remove ts-ignore when new version of solodb-typescript-core with the correct interface is released
  // @ts-ignore
  let stepIsStarted = useRef<boolean>(runStep.is_started);
  let stepIsFinished = useRef<boolean>(runStep.is_finished);

  if (stepIsFinished) {
    return <div>Step is finished</div>
  }

  if (isLoading) {
    return <div>Loading...</div>;
  }

  function finishOperation(runStep: RunStep) {
    setStatusMessage(statusMessages.movingOut);
    setIsProcessing(true);
    finishStep(runStep).then(() => {
      setIsProcessing(false);
      setStatusMessage(null);
      // @ts-ignore
      reloadRunStep();
    });
  }

  function startOperation(runStep: RunStep) {
    setStatusMessage(statusMessages.movingIn);
    setIsProcessing(true);
    startStep(runStep).then(() => {
      setIsProcessing(false);
      setStatusMessage(null);
      // @ts-ignore
      reloadRunStep();
    });
  }


  return (
    <>
      {data!.items.length === 0 && <Alert variant={"info"}>No checklist found</Alert>}

      {data!.items.length > 0 && (
        <ListGroup>
          {data!.items.map((checklistItem: RunStepChecklistItem, i: React.Key) => (
            <ChecklistItemElement checklistItem={checklistItem} refetch={refetch} key={i} />
          ))}
        </ListGroup>
      )}

      <div className={"d-flex justify-content-between mt-3"}>
        <div className={"d-flex gap-2 align-items-center"}>
          {stepIsStarted ? (
            <div>
              <Button variant={"success"} onClick={() => finishOperation(runStep)} disabled={isProcessing}>
                {statusMessage !== null ? statusMessage : "Move out"}
              </Button>
            </div>
          ) : (
            <div>
              <Button variant={"success"} onClick={() => startOperation(runStep)} disabled={isProcessing}>
                {statusMessage !== null ? statusMessage : "Move in"}
              </Button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
