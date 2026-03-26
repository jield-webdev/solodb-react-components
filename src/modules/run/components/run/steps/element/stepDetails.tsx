import React, { useContext } from "react";
import { Card, Col, Row } from "react-bootstrap";
import { RunStepParametersTable } from "@jield/solodb-react-components/modules/run/components/shared/parameters/runStepParametersTable";
import { EmphasizedParametersContext } from "@jield/solodb-react-components/modules/run/contexts/emphasizedParametersContext";
import UploadFilesToStep from "@jield/solodb-react-components/modules/run/components/shared/files/uploadFilesToStep";
import RunPartsRegularFlow from "@jield/solodb-react-components/modules/run/components/shared/parts_table/runPartsRegularFlow";
import { RunContext } from "@jield/solodb-react-components/modules/run/contexts/runContext";
import { RunStep, RunStepPart, RunPart, RunTypeEnum, Run } from "@jield/solodb-typescript-core";

export default function StepDetails({
  run,
  step,
  stepParts,
  parts,
  refetchFn = () => null,
}: {
  run?: Run;
  step: RunStep;
  stepParts: RunStepPart[];
  parts: RunPart[];
  refetchFn?: (keys: any[]) => void;
}) {
  const { run: contextRun } = useContext(RunContext);
  const { showOnlyEmphasizedParameters } = useContext(EmphasizedParametersContext);
  const resolvedRun = run ?? contextRun;

  if (!resolvedRun) {
    return null;
  }

  return (
    <Card className="p-4 my-3">
      <Card.Body>
        <Row>
          <Col md="6">
            <h4>Experimental split</h4>
            <RunPartsRegularFlow
              run={resolvedRun}
              runStep={step}
              runStepParts={stepParts}
              refetchFn={() => {
                refetchFn(["runStepParts"]);
              }}
            />
            {step.has_remark && (
              <>
                <h4>Remark</h4>
                <span dangerouslySetInnerHTML={{ __html: step.remark }} />
              </>
            )}
          </Col>

          <Col md="6">
            {/* parameters table */}
            <h4>Parameters</h4>
            <RunStepParametersTable
              runStep={step}
              showOnlyEmphasizedParameters={showOnlyEmphasizedParameters}
              refetchFn={() => {
                refetchFn([JSON.stringify(step), "parameters"]);
              }}
            />

            <h4>Files</h4>
            <UploadFilesToStep
              runStep={step}
              refetchFn={() => {
                refetchFn(["runSteps"]);
              }}
            />
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
}
