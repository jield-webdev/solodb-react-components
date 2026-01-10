import React from "react";
import RequirementValuesWithPartTable from "@/modules/run/components/shared/requirement/requirementValuesWithPartTable";
import { Link, useParams } from "react-router-dom";
import { Table } from "react-bootstrap";
import { Requirement, RunStep, RunStepPart, RunPart, MeasurementResult } from "@jield/solodb-typescript-core";

export default function RequirementDetails({
  requirement,
  step,
  stepParts,
  parts,
  measurementResults,
}: {
  requirement: Requirement;
  step: RunStep;
  stepParts: RunStepPart[];
  parts: RunPart[];
  measurementResults: MeasurementResult[];
}) {
  const filteredStepParts = stepParts.filter((part) => part.step.id === (requirement.requirement_for_step?.id ?? requirement.step.id));
  const { environment } = useParams();
  return (
    <>
      <tr>
        <td colSpan={7}>
          <div className={"d-flex gap-2"}>
            <div style={{ flexGrow: 1, flex: "1 1 50%" }}>
              <h4>Measurement results</h4>
              <RequirementValuesWithPartTable
                requirement={requirement}
                step={step}
                stepParts={filteredStepParts}
                parts={parts}
                measurementResults={measurementResults}
                editOnly={true}
              />
            </div>
            <div style={{ flexGrow: 1, flex: "1 1 50%" }}>
              {" "}
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
                    <th>min value</th>
                    <th>max value</th>
                    <th>inclusive</th>
                  </tr>
                </thead>
                <tbody>
                  {requirement.targets.map((target) => (
                    <tr key={target.id}>
                      <td>{target.min_value}</td>
                      <td>{target.max_value}</td>
                      <td>{target.inclusive ? "yes" : "no"}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          </div>
        </td>
      </tr>
    </>
  );
}
