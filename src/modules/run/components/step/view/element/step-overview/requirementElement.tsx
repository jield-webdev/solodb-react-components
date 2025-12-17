import React, { useContext, useState } from "react";
import { Badge } from "react-bootstrap";
import { Link, useParams } from "react-router-dom";
import DateFormat from "@/modules/partial/dateFormat";
import { RunStepContext } from "@/modules/run/contexts/runStepContext";
import { useQueries } from "@tanstack/react-query";
import { MeasurementResultsBadges } from "@/modules/run/components/shared/requirement/measurementResultsBadge";
import RequirementDetails from "@/modules/run/components/step/view/element/step-overview/requirementDetails";
import { listMeasurementResults, Requirement, RunPart, RunStepPart } from "solodb-typescript-core";

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
        return runStep.id === contextRunStep.id ? "table-success" : "";
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
      return "table-danger";
    }
    return runStep.id === contextRunStep.id ? "table-success" : "";
  };

  return (
    <>
      {!hideLabel && runStep.has_label && runStep.is_own_label && (
        <tr>
          <td className={"bg-info"} colSpan={7}>
            {runStep.label?.label}
          </td>
        </tr>
      )}

      {runStep.step_group && firstInGroup && (
        <tr>
          <td className={"bg-secondary"} colSpan={7}>
            {runStep.step_group?.label}
          </td>
        </tr>
      )}

      <tr className={getRowStatus()}>
        <td className={runStep.has_step_group ? "ps-4" : ""}>
          {runStep.id !== contextRunStep.id && (
            <i
              className={"fa " + (showRequirementDetail ? "fa-chevron-down" : "fa-chevron-right")}
              style={{ cursor: "pointer" }}
              onClick={() => {
                setShowRequirementDetail(!showRequirementDetail);
              }}
            />
          )}
        </td>
        <td>
          <MeasurementResultsBadges
            requirement={requirement}
            step={runStep}
            parts={runParts}
            stepParts={runStepParts}
            measurementResults={measurementResultsQuery.data?.items ?? []}
          />
        </td>
        <td>
          {runStep.number} {runStep.is_skipped && <Badge bg={"info"}>Skipped</Badge>}
        </td>
        <td>
          <Badge bg="info">requirement</Badge>
          {" "}
          <Link
            to={`/${environment}/operator/run/step/${runStep.id}`}
            dangerouslySetInnerHTML={{ __html: runStep.name }}
          />{" "}
        </td>
        <td>{runStep.finish_user ? runStep.finish_user.initials : ""}</td>
        <td>{runStep.has_rework ? <span className={"badge bg-primary"}>Rework</span> : ""}</td>
        <td>{runStep.is_finished ? <DateFormat format={"DD-MM-YYYY"}>{runStep.finish_date!}</DateFormat> : ""}</td>
      </tr>

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
