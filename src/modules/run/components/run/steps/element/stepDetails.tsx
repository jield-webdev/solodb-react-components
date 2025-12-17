import React, { useContext } from "react";
import { Card, Col, Row } from "react-bootstrap";
import { RunStepParametersTable } from "@/modules/run/components/shared/parameters/runStepParametersTable";
import { EmphasizedParametersContext } from "@/modules/run/contexts/emphasizedParametersContext";
import UploadFilesToStep from "@/modules/run/components/shared/files/uploadFilesToStep";
import RunPartsResearchRun from "@/modules/run/components/step/view/element/parts/runPartsResearchRun";
import RunPartsProductionRun from "@/modules/run/components/step/view/element/parts/runPartsProductionRun";
import { RunContext } from "@/modules/run/contexts/runContext";
import { RunStep, RunStepPart, RunPart, RunTypeEnum } from "solodb-typescript-core";

export default function StepDetails({
  step,
  stepParts,
  parts,
  refetchFn,
}: {
  step: RunStep;
  stepParts: RunStepPart[];
  parts: RunPart[];
  refetchFn: (keys: any[]) => void;
}) {
  const { showOnlyEmphasizedParameters } = useContext(EmphasizedParametersContext);
  const { run } = useContext(RunContext);

  return (
    <Card className="p-4 my-3">
      <Card.Body>
        <Row>
          <Col md="6">
            {run.run_type === RunTypeEnum.RESEARCH && (
              <RunPartsResearchRun
                run={run}
                runStep={step}
                runStepParts={stepParts}
                refetchFn={() => {
                  refetchFn(["runStepParts"]);
                }}
              />
            )}
            {run.run_type === RunTypeEnum.PRODUCTION && (
              <RunPartsProductionRun
                run={run}
                runStep={step}
                runParts={parts}
                refetchFn={() => {
                  refetchFn(["runStepParts"]);
                }}
              />
            )}

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
