import {
  finishStep,
  listRunParts,
  listRunStepChecklistItems,
  listRunStepParts,
  Run,
  RunPart,
  RunStep,
  RunStepChecklistItem,
  RunStepPart,
  startStep,
} from "@jield/solodb-typescript-core";
import StepRemark from "./element/stepRemark";
import { RunStepParametersTable } from "../../shared/parameters/runStepParametersTable";
import UploadFilesToStep from "../../shared/files/uploadFilesToStep";
import React, { useEffect, useMemo, useState } from "react";
import RunPartsQrFlow from "../../shared/parts_table/runPartsQrFlow";
import { useQueries, useQuery } from "@tanstack/react-query";
import { Alert, Button, ListGroup, OverlayTrigger, Placeholder, Tooltip } from "react-bootstrap";
import ChecklistItemElement from "./element/checklist/checklistItemElement";

export default function RunStepExecuteMinimal({
  run,
  runStep,
  showOnlyEmphasizedParameters,
  reloadRunStepFn,
}: {
  run: Run;
  runStep: RunStep;
  showOnlyEmphasizedParameters: boolean;
  reloadRunStepFn: () => void;
}) {
  const { data: checklistData, refetch } = useQuery({
    queryKey: ["checklist", runStep?.id],
    queryFn: () => listRunStepChecklistItems({ runStep: runStep }),
  });

  const checklistItems = useMemo(() => checklistData?.items, [checklistData]);

  const [runPartsQuery, runStepPartsQuery] = useQueries({
    queries: [
      {
        queryKey: ["runParts", run.id, runStep.part_level],
        queryFn: () => listRunParts({ run: run, level: runStep.part_level }),
      },
      {
        queryKey: ["runStepParts", runStep.id],
        queryFn: () => listRunStepParts({ step: runStep }),
      },
    ],
  });

  const allPartsFinished = useMemo(() => {
    const runParts = (runPartsQuery.data?.items as RunPart[] | undefined) ?? [];
    const runStepParts = (runStepPartsQuery.data?.items as RunStepPart[] | undefined) ?? [];
    const leveledParts = runParts.filter((p) => p.part_level === runStep.part_level);
    if (leveledParts.length === 0) return false;
    return leveledParts.every((part) => {
      const stepPart = runStepParts.find((sp) => sp.part_id == part.id);
      return stepPart?.processed === true;
    });
  }, [runPartsQuery.data, runStepPartsQuery.data, runStep.part_level]);

  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const handleMoveOutButton = () => {
    setIsProcessing(true);
    finishStep(runStep).finally(() => {
      setIsProcessing(false);
      reloadRunStepFn();
    });
  };

  return (
    <>
      <div className="d-flex justify-content-between mb-2">
        <div>
          <h3 className="mb-2 text-start">Parts</h3>
        </div>
        <OverlayTrigger
          placement="top"
          overlay={
            <Tooltip id="tooltip-move-out">
              {allPartsFinished ? "Finish step" : "Finish all parts before moving out"}
            </Tooltip>
          }
        >
          <span>
            <Button
              variant={allPartsFinished ? "success" : "light"}
              onClick={handleMoveOutButton}
              disabled={isProcessing || !allPartsFinished}
            >
              {!isProcessing ? "Move out" : "Moving out..."}
            </Button>
          </span>
        </OverlayTrigger>
      </div>

      <RunPartsQrFlow run={run} runStep={runStep} />

      <h3 className="mt-2">Parameters</h3>
      <RunStepParametersTable runStep={runStep} showOnlyEmphasizedParameters={showOnlyEmphasizedParameters} />

      <div className="row row-cols-2">
        <div className="col">
          <StepRemark runStep={runStep} reloadRunStep={reloadRunStepFn} />
        </div>
        <div className="col">
          {runStep.has_instructions && runStep.instructions && (
            <React.Fragment>
              <h3 className="mb-2 text-start">Instructions</h3>
              <span
                dangerouslySetInnerHTML={{
                  __html: runStep.instructions,
                }}
              />
            </React.Fragment>
          )}
        </div>
      </div>
      <div className="row row-cols-2">
        <div className="col">
          <h3 className="mt-2">Checklist</h3>
          {!checklistItems && (
            <ListGroup>
              {Array.from({ length: 1 }).map((_, index) => (
                <ListGroup.Item key={index}>
                  <Placeholder as="div" animation="glow">
                    <Placeholder xs={17} /> <Placeholder xs={4} /> <Placeholder xs={6} />
                  </Placeholder>
                </ListGroup.Item>
              ))}
            </ListGroup>
          )}
          {checklistItems && (
            <>
              {checklistItems.length === 0 && <Alert variant={"info"}>No checklist found</Alert>}

              {checklistItems.length > 0 && (
                <ListGroup>
                  {checklistItems.map((checklistItem: RunStepChecklistItem) => (
                    <ChecklistItemElement checklistItem={checklistItem} refetch={refetch} key={checklistItem.id} />
                  ))}
                </ListGroup>
              )}
            </>
          )}
        </div>
        <div className="col">
          <h3 className="mt-2">Step files</h3>
          <UploadFilesToStep runStep={runStep} />
        </div>
      </div>
    </>
  );
}
