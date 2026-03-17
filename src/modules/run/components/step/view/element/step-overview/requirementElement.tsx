import React, { useContext, useState } from "react";
import { Badge } from "react-bootstrap";
import { Link, useParams } from "react-router-dom";
import DateFormat from "@jield/solodb-react-components/modules/partial/dateFormat";
import { RunStepContext } from "@jield/solodb-react-components/modules/run/contexts/runStepContext";
import { useQueries } from "@tanstack/react-query";
import { MeasurementResultsBadges } from "@jield/solodb-react-components/modules/run/components/shared/requirement/measurementResultsBadge";
import RequirementDetails from "@jield/solodb-react-components/modules/run/components/step/view/element/step-overview/requirementDetails";
import { listMeasurementResults, Requirement, RunPart, RunStepPart } from "@jield/solodb-typescript-core";

export default function RequirementElement({
  requirement,
  runParts,
  runStepParts,
  hideLabel,
  firstInGroup,
}: {
  requirement: Requirement;
  runParts: RunPart[];
  runStepParts: RunStepPart[];
  hideLabel?: boolean;
  firstInGroup: boolean;
}) {
  const runStep = requirement.step;
  const { environment } = useParams();
  const { runStep: contextRunStep } = useContext(RunStepContext);
  const [showRequirementDetail, setShowRequirementDetail] = useState<boolean>(false);

  const queries = useQueries({
    queries: [
      {
        queryKey: ["requirement", "measurementResults", JSON.stringify(requirement.measurement.id)],
        queryFn: () => listMeasurementResults({ measurement: requirement.measurement }),
      },
    ],
  });

  const [measurementResultsQuery] = queries;

  const getRowStatus = (): string => {
    if (!measurementResultsQuery.data) {
      return "";
    }

    let failed = false;
    for (const stepPart of runStepParts) {
      const value = measurementResultsQuery.data?.items
        .find((r) => r.values.some((v) => v.step_part_id === stepPart.id))
        ?.values.find((v) => v.step_part_id === stepPart.id);

      if (!(value && !isNaN(parseFloat(value.string_value)))) {
        return runStep.id === contextRunStep.id ? "bg-success-subtle" : "";
      }

      const val = parseFloat(value.string_value);

      const foundFail = requirement.targets.some((t) => {
        if (t.inclusive) {
          return !(t.min_value <= val && t.max_value >= val);
        } else {
          return !(t.min_value < val && t.max_value > val);
        }
      });

      if (foundFail) {
        failed = true;
        break;
      }
    }

    if (failed) {
      return "bg-danger-subtle";
    }
    return runStep.id === contextRunStep.id ? "bg-success-subtle" : "";
  };

  return (
    <>
      {!hideLabel && runStep.has_label && runStep.is_own_label && (
        <div className="bg-info text-white rounded px-3 py-1">
          {runStep.label?.label}
        </div>
      )}

      {runStep.step_group && firstInGroup && (
        <div className="bg-secondary text-white rounded px-3 py-1">
          {runStep.step_group?.label}
        </div>
      )}

      <div
        className={`d-flex flex-wrap align-items-center gap-3 border rounded px-3 py-2 ${getRowStatus()} ${
          runStep.has_step_group ? "ms-4" : ""
        }`}
      >
        <div className="d-flex align-items-center gap-2 flex-shrink-0">
          {runStep.id !== contextRunStep.id && (
            <i
              className={"fa " + (showRequirementDetail ? "fa-chevron-down" : "fa-chevron-right")}
              style={{ cursor: "pointer" }}
              onClick={() => {
                setShowRequirementDetail(!showRequirementDetail);
              }}
            />
          )}
        </div>
        <div className="d-flex flex-wrap align-items-center gap-3 flex-grow-1 min-w-0">
          <div className="flex-shrink-0">
            <MeasurementResultsBadges
              requirement={requirement}
              step={runStep}
              parts={runParts}
              stepParts={runStepParts}
              measurementResults={measurementResultsQuery.data?.items ?? []}
            />
          </div>
          <div className="flex-shrink-0 text-nowrap">
            {runStep.number} {runStep.is_skipped && <Badge bg={"info"}>Skipped</Badge>}
          </div>
          <div className="flex-grow-1 min-w-0">
            <Badge bg="info">requirement</Badge>{" "}
            <Link
              to={`/${environment}/operator/run/step/${runStep.id}`}
              dangerouslySetInnerHTML={{ __html: runStep.name }}
            />{" "}
          </div>
        </div>
        <div className="d-flex align-items-center gap-3 flex-shrink-0 ms-auto">
          <span className="text-nowrap">{runStep.finish_user ? runStep.finish_user.initials : ""}</span>
          <span className="text-nowrap">{runStep.has_rework ? <span className={"badge bg-primary"}>Rework</span> : ""}</span>
          <span className="text-nowrap">
            {runStep.is_finished ? <DateFormat format={"DD-MM-YYYY"}>{runStep.finish_date!}</DateFormat> : ""}
          </span>
        </div>
      </div>

      {showRequirementDetail && (
        <RequirementDetails
          requirement={requirement}
          step={runStep}
          stepParts={runStepParts}
          parts={runParts}
          measurementResults={measurementResultsQuery.data?.items ?? []}
        />
      )}
    </>
  );
}
