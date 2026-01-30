import React, { useContext, useRef, useState, useEffect } from "react";
import { Alert, Button, ListGroup } from "react-bootstrap";
import { Link, useNavigate, useParams } from "react-router-dom";
import axios, { AxiosResponse } from "axios";
import { RunStepContext } from "@jield/solodb-react-components/modules/run/contexts/runStepContext";
import { useQuery } from "@tanstack/react-query";
import ChecklistItemElement from "@jield/solodb-react-components/modules/run/components/step/view/element/checklist/checklistItemElement";
import {
  listRunStepChecklistItems,
  Run,
  RunStep,
  RunStepChecklistItem,
  finishStep,
} from "@jield/solodb-typescript-core";

const statusMessages = {
  movingOut: "Moving out...",
  skipping: "Skipping...",
  unskipping: "Unskipping...",
  operationFinished: "Operation finished",
  operationSkipped: "Operation skipped",
  operationUnskipped: "Operation unskipped",
} as const;

export default function RunStepChecklist({
  run,
  runStep,
  reloadRunStep,
}: {
  run?: Run;
  runStep?: RunStep;
  reloadRunStep?: () => void;
}) {
  let navigate = useNavigate();
  const { environment } = useParams();

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
    setStatusMessage(statusMessages.movingOut);
    setIsProcessing(true);
    setTimeout(() => setIsProcessing(false), 1000);
    finishStep(runStep).then((response: AxiosResponse<RunStep>) => {
      setStatusMessage(statusMessages.operationFinished);
      if (response.data.next_step_id !== null) {
        navigate(`/${environment}/operator/run/step/${response.data.next_step_id}`);
      } else {
        // @ts-ignore
        reloadRunStep();
      }
    });
  }

  function skipOperation(runStep: RunStep) {
    setStatusMessage(statusMessages.skipping);
    setIsProcessing(true);
    setTimeout(() => setIsProcessing(false), 1000);
    axios
      .create()
      .patch("update/run/step/skip/" + runStep.id, {})
      .then(() => {
        setStatusMessage(statusMessages.operationSkipped);
        // @ts-ignore
        reloadRunStep();
        if (runStep.next_step_id !== null) {
          // navigate(`/${environment}/operator/run/step/${runStep.next_step_id}`);
        }
      });
  }

  function unSkipOperation(runStep: RunStep) {
    setStatusMessage(statusMessages.unskipping);
    setIsProcessing(true);
    setTimeout(() => setIsProcessing(false), 1000);
    axios
      .create()
      .patch("update/run/step/un-skip/" + runStep.id, {})
      .then(() => {
        setStatusMessage(statusMessages.operationUnskipped);
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
                {statusMessage === statusMessages.operationFinished || statusMessage === statusMessages.movingOut
                  ? statusMessage
                  : "Move out"}
              </Button>
            </div>
          )}

          {run.access.edit && !runStep.is_skipped && (
            <div>
              <Button variant={"primary"} onClick={() => skipOperation(runStep)} disabled={isProcessing}>
                {statusMessage === statusMessages.operationSkipped || statusMessage === statusMessages.skipping
                  ? statusMessage
                  : "Skip operation"}
              </Button>
            </div>
          )}

          {run.access.edit && runStep.is_skipped && (
            <div>
              <Button variant={"warning"} onClick={() => unSkipOperation(runStep)} disabled={isProcessing}>
                {statusMessage === statusMessages.operationUnskipped || statusMessage === statusMessages.unskipping
                  ? statusMessage
                  : "Unskip operation"}
              </Button>
            </div>
          )}
        </div>

        <div className={"d-flex gap-2"}>
          {runStep.next_step_id && (
            <div>
              <Link to={`/${environment}/operator/run/step/${runStep.next_step_id}`} className={"btn btn-secondary"}>
                Next step
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
