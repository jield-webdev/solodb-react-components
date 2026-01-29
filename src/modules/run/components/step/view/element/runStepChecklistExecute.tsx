import React, { useContext, useRef, useState, useEffect } from "react";
import { Alert, Button, ListGroup } from "react-bootstrap";
import { Link, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { RunStepContext } from "@jield/solodb-react-components/modules/run/contexts/runStepContext";
import { useQuery } from "@tanstack/react-query";
import ChecklistItemElement from "@jield/solodb-react-components/modules/run/components/step/view/element/checklist/checklistItemElement";
import { listRunStepChecklistItems, Run, RunStep, RunStepChecklistItem } from "@jield/solodb-typescript-core";

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
    reloadRunStep =  contextReloadFn ?? (() => null); 
  }

  if (!runStep || !reloadRunStep || !run) {
      return <>Please set RunStepContext in RunStepChecklist</>
  }

  let canFinishOperation = useRef<boolean>(false);

  //Grab the checklist, via a tanstack query
  const { data, error, isLoading, refetch } = useQuery({
    queryKey: ["checklist", runStep.id],
    queryFn: () => listRunStepChecklistItems({ runStep: runStep }),
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  function finishOperation(runStep: RunStep) {
    setStatusMessage("Moving out...");
    setIsProcessing(true);
    setTimeout(() => setIsProcessing(false), 1000);
    axios
      .create()
      .patch<RunStep>("update/run/step/finish/" + runStep.id, {})
      .then((response) => {
        setStatusMessage("Operation finished");
        // @ts-ignore
        reloadRunStep();
      });
  }

  let hasRenderedFinishedButton = false;
  canFinishOperation.current = !runStep.is_finished;

  data!.items.forEach((runStepChecklistItem: RunStepChecklistItem) => {
    let canFinishChecklist = !runStepChecklistItem.is_executed && !hasRenderedFinishedButton;

    //Save the state in the object
    runStepChecklistItem.can_finish = canFinishChecklist;

    if (canFinishChecklist) {
      //If we have 1 checklist, we set the value of hasRenderedFinishedButton to true, so it won't ben rendered again
      hasRenderedFinishedButton = true;
      canFinishOperation.current = false;
    }
  });

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
          {canFinishOperation.current && (
            <div>
              <Button variant={"success"} onClick={() => finishOperation(runStep)} disabled={isProcessing}>
                {statusMessage === "Operation finished" || statusMessage === "Moving out..." ? statusMessage : "Move out"}
              </Button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
