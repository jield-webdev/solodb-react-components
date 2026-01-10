import React from "react";
import { Card, Col, Row, Table } from "react-bootstrap";
import UploadFilesToStep from "@jield/solodb-react-components/modules/run/components/shared/files/uploadFilesToStep";
import { Link, useParams } from "react-router-dom";
import RequirementValuesWithPartTable from "@jield/solodb-react-components/modules/run/components/shared/requirement/requirementValuesWithPartTable";
import RequirementValuesByStep from "../../../shared/requirement/requirementValuesByStep";
import { Requirement, RunStep, RunStepPart, RunPart, MeasurementResult } from "@jield/solodb-typescript-core";

export default function RequirementDetails({
  requirement,
  step,
  stepParts,
  parts,
  measurementResults,
  refetchFn,
}: {
  requirement: Requirement;
  step: RunStep;
  stepParts: RunStepPart[];
  parts: RunPart[];
  measurementResults: MeasurementResult[];
  refetchFn: (keys: string[]) => void;
}) {
  const { environment } = useParams();

  return (
    <Card className="p-4 my-3">
      <Card.Body>
        <Row>
          <Col md="7">
            <h4>Measurements by part</h4>
            <RequirementValuesWithPartTable
              requirement={requirement}
              step={step}
              stepParts={stepParts}
              parts={parts}
              measurementResults={measurementResults}
              refetchFn={refetchFn}
            />
            <h4>Measurements for whole step</h4>
            <RequirementValuesByStep
              requirement={requirement}
              measurementResults={measurementResults}
              refetchFn={refetchFn}
            />
          </Col>
          <Col md="5">
            <h4>Monitored Step</h4>
            <Link to={`/${environment}/operator/run/step/${requirement.requirement_for_step?.id ?? requirement.step.id}`}>
              <span>
                <i className="fa fa-search"></i> {requirement.requirement_for_step?.name ?? requirement.step.name}
              </span>
            </Link>
            <h4>Definition</h4>
            <span>{requirement.definition}</span>
            <h4>Targets</h4>
            <Table size="sm" striped={false} bordered={false}>
              <thead>
                <tr>
                  <th>parameter</th>
                  <th>min value</th>
                  <th>max value</th>
                  <th>inclusive</th>
                </tr>
              </thead>
              <tbody>
                {requirement.targets.map((target) => (
                  <tr key={target.id}>
                    <td>{target.logging_parameter.name}</td>
                    <td>{target.min_value}</td>
                    <td>{target.max_value}</td>
                    <td>{target.inclusive ? "yes" : "no"}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
            <h4>Files</h4>
            <UploadFilesToStep
              runStep={step}
              refetchFn={() => {
                refetchFn(["requirements"]);
              }}
            />
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
}
