import {
  finishStep,
  listRunStepChecklistItems,
  Run,
  RunStep,
  RunStepChecklistItem,
  startStep,
} from "@jield/solodb-typescript-core";
import StepRemark from "./element/stepRemark";
import { RunStepParametersTable } from "../../shared/parameters/runStepParametersTable";
import UploadFilesToStep from "../../shared/files/uploadFilesToStep";
import React, { useEffect, useMemo, useState } from "react";
import RunPartsQrFlow from "../../shared/parts_table/runPartsQrFlow";
import { useQuery } from "@tanstack/react-query";
import { Alert, Button, ListGroup, Placeholder } from "react-bootstrap";
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
  const {
    data: checklistData,
    refetch,
  } = useQuery({
    queryKey: ["checklist", runStep?.id],
    queryFn: () => listRunStepChecklistItems({ runStep: runStep }),
  });

  const checklistItems = useMemo(() => checklistData?.items, [checklistData]);

  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  useEffect(() => {
    if (!statusMessage) return;
    const timer = setTimeout(() => setStatusMessage(null), 3000);
    return () => clearTimeout(timer);
  }, [statusMessage]);

  const handleMoveOutButton = () => {
    setStatusMessage("Moving out...");
    setIsProcessing(true);
    finishStep(runStep).finally(() => {
      setIsProcessing(false);
      setStatusMessage(null);
      reloadRunStepFn();
    });
  };

  return (
    <>
      <div>
        <h3 className="mb-2 text-start">Parts</h3>
        <RunPartsQrFlow run={run} runStep={runStep} />
      </div>

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

      <div className="d-flex justify-content-end mt-3">
        <Button variant="success" onClick={handleMoveOutButton} disabled={isProcessing}>
          {statusMessage ?? "Move out"}
        </Button>
      </div>
    </>
  );
}
