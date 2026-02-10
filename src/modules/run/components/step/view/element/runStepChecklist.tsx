import React, { useContext, useMemo, useState, useEffect, useCallback } from "react";
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
import LoadingComponent from "@jield/solodb-react-components/modules/core/components/common/LoadingComponent";

const statusMessages = {
  movingOut: "Moving out...",
  skipping: "Skipping...",
  unskipping: "Unskipping...",
  operationFinished: "Operation finished",
  operationSkipped: "Operation skipped",
  operationUnskipped: "Operation unskipped",
} as const;

type StatusMessage = (typeof statusMessages)[keyof typeof statusMessages];

export default function RunStepChecklist({
  run,
  runStep,
  reloadRunStep,
}: {
  run?: Run;
  runStep?: RunStep;
  reloadRunStep?: () => void;
}) {
  const navigate = useNavigate();
  const { environment } = useParams();

  const [statusMessage, setStatusMessage] = useState<StatusMessage | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { run: contextRun, runStep: contextRunStep, reloadRunStep: contextReloadRunStep } = useContext(RunStepContext);

  useEffect(() => {
    if (statusMessage) {
      const timer = setTimeout(() => {
        setStatusMessage(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [statusMessage]);

  const resolvedRun = run ?? contextRun;
  const resolvedRunStep = runStep ?? contextRunStep;
  const resolvedReloadRunStep = reloadRunStep ?? contextReloadRunStep ?? (() => null);

  if (!resolvedRunStep || !resolvedReloadRunStep || !resolvedRun) {
    return <>Please set RunStepContext in RunStepChecklist</>;
  }

  //Grab the checklist, via a tanstack query
  const { data, error, isLoading, refetch } = useQuery({
    queryKey: ["checklist", resolvedRunStep.id],
    queryFn: () => listRunStepChecklistItems({ runStep: resolvedRunStep }),
  });

  const finishOperation = useCallback(
    async (targetRunStep: RunStep) => {
      setStatusMessage(statusMessages.movingOut);
      setIsProcessing(true);
      try {
        const response: AxiosResponse<RunStep> = await finishStep(targetRunStep);
        setStatusMessage(statusMessages.operationFinished);
        if (response.data.next_step_id !== null) {
          navigate(`/${environment}/operator/run/step/${response.data.next_step_id}`);
        } else {
          resolvedReloadRunStep();
        }
      } finally {
        setIsProcessing(false);
      }
    },
    [environment, navigate, resolvedReloadRunStep]
  );

  const skipOperation = useCallback(
    async (targetRunStep: RunStep) => {
      setStatusMessage(statusMessages.skipping);
      setIsProcessing(true);
      try {
        await axios.create().patch(`update/run/step/skip/${targetRunStep.id}`, {});
        setStatusMessage(statusMessages.operationSkipped);
        resolvedReloadRunStep();
      } finally {
        setIsProcessing(false);
      }
    },
    [resolvedReloadRunStep]
  );

  const unSkipOperation = useCallback(
    async (targetRunStep: RunStep) => {
      setStatusMessage(statusMessages.unskipping);
      setIsProcessing(true);
      try {
        await axios.create().patch(`update/run/step/un-skip/${targetRunStep.id}`, {});
        setStatusMessage(statusMessages.operationUnskipped);
        resolvedReloadRunStep();
      } finally {
        setIsProcessing(false);
      }
    },
    [resolvedReloadRunStep]
  );

  const { checklistItems, canFinishOperation } = useMemo(() => {
    const items = data?.items ?? [];
    const firstPendingIndex = items.findIndex((item) => !item.is_executed);
    const enhancedItems = items.map((item, index) => ({
      ...item,
      can_finish: index === firstPendingIndex,
    })) as RunStepChecklistItem[];
    const canFinish = !resolvedRunStep.is_finished && firstPendingIndex === -1;
    return { checklistItems: enhancedItems, canFinishOperation: canFinish };
  }, [data, resolvedRunStep.is_finished]);

  if (isLoading) {
    return <LoadingComponent message={"Loading..."} />;
  }

  if (error) {
    return <Alert variant="danger">Failed to load checklist.</Alert>;
  }

  return (
    <>
      {checklistItems.length === 0 && <Alert variant={"info"}>No checklist found</Alert>}

      {checklistItems.length > 0 && (
        <ListGroup>
          {checklistItems.map((checklistItem: RunStepChecklistItem) => (
            <ChecklistItemElement checklistItem={checklistItem} refetch={refetch} key={checklistItem.id} />
          ))}
        </ListGroup>
      )}

      <div className={"d-flex justify-content-between mt-3"}>
        <div className={"d-flex gap-2 align-items-center"}>
          {canFinishOperation && (
            <div>
              <Button variant={"success"} onClick={() => finishOperation(resolvedRunStep)} disabled={isProcessing}>
                {statusMessage === statusMessages.operationFinished || statusMessage === statusMessages.movingOut
                  ? statusMessage
                  : "Move out"}
              </Button>
            </div>
          )}

          {resolvedRun.access.edit && !resolvedRunStep.is_skipped && (
            <div>
              <Button variant={"primary"} onClick={() => skipOperation(resolvedRunStep)} disabled={isProcessing}>
                {statusMessage === statusMessages.operationSkipped || statusMessage === statusMessages.skipping
                  ? statusMessage
                  : "Skip operation"}
              </Button>
            </div>
          )}

          {resolvedRun.access.edit && resolvedRunStep.is_skipped && (
            <div>
              <Button variant={"warning"} onClick={() => unSkipOperation(resolvedRunStep)} disabled={isProcessing}>
                {statusMessage === statusMessages.operationUnskipped || statusMessage === statusMessages.unskipping
                  ? statusMessage
                  : "Unskip operation"}
              </Button>
            </div>
          )}
        </div>

        <div className={"d-flex gap-2"}>
          {resolvedRunStep.next_step_id && (
            <div>
              <Link
                to={`/${environment}/operator/run/step/${resolvedRunStep.next_step_id}`}
                className={"btn btn-secondary"}
              >
                Next step
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
