import React, { useState, useEffect, useMemo } from "react";
import { Link, useParams } from "react-router-dom";

import ModuleStatusElement from "@jield/solodb-react-components/modules/equipment/components/partial/moduleStatusElement";
import { Badge, Placeholder } from "react-bootstrap";
import RequirementDetails from "@jield/solodb-react-components/modules/run/components/run/steps/element/requirementDetails";
import { keepPreviousData, useQueries, useQueryClient } from "@tanstack/react-query";
import { MeasurementResultsBadges } from "@jield/solodb-react-components/modules/run/components/shared/requirement/measurementResultsBadge";
import { Requirement, RunStep, RunPart, RunStepPart, EquipmentModule, MeasurementResult, listMeasurementResults,
  listRunStepParts
} from "@jield/solodb-typescript-core";

export default function RequirementStepInList({
  requirement,
  step,
  parts,
  refetchFn,
}: {
  requirement: Requirement;
  step: RunStep;
  parts: RunPart[];
  refetchFn: (key: any[]) => void;
}) {
  const { environment } = useParams();
  const [isExpanded, setIsExpanded] = useState(false);

  const [stepModule, setStepModule] = useState<EquipmentModule>(step.process_module.module);

  // Update stepModule when step.process_module.module changes
  useEffect(() => {
    setStepModule(step.process_module.module);
  }, [step.process_module.module]);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const queryClient = useQueryClient();
  const queries = useQueries({
    queries: [
      {
        queryKey: ["requirement", "measurementResults", JSON.stringify(requirement.measurement.id)],
        queryFn: () => listMeasurementResults({ measurement: requirement.measurement }),
      },
      {
        queryKey: ["runStepParts", (requirement.requirement_for_step?.id ?? requirement.step.id)],
        queryFn: () => listRunStepParts({ step: requirement.requirement_for_step ?? requirement.step }),
        placeholderData: keepPreviousData,
      },
    ],
  });

  const reloadQueriesByKey = (keys: any[]) => {
    if (keys[0] === "requirement") {
      queryClient.refetchQueries({ queryKey: keys });
    }

    refetchFn(keys);
  };

  const [measurementResultsQuery, runStepPartsQuery] = queries;
  const isLoading = queries.some((q) => q.isLoading);

  const runStepParts = useMemo(
    () => (runStepPartsQuery.data?.items ?? []) as RunStepPart[],
    [runStepPartsQuery.data?.items]
  );

  const measurementResults = useMemo(
    () => (measurementResultsQuery.data?.items ?? []) as MeasurementResult[],
    [measurementResultsQuery.data?.items]
  );


  const getRowStatus = (measurementResults: MeasurementResult[]): string => {
    if (measurementResults.length == 0) {
      if (isLoading) {
        return "";
      }
      return "table-info";
    }

    let failed = false;
    for (const measurement of measurementResults) {
      const foundFail = measurement.values.some((value) => {
        if (!(value && !isNaN(parseFloat(value.string_value)))) {
          return false;
        }

        const val = parseFloat(value.string_value);
        const target = requirement.targets.find((target) => target.logging_parameter.id == value.logging_parameter.id);

        if (!target) {
            return false;
        }

        if (target.inclusive) {
          return !(target.min_value <= val && target.max_value >= val);
        } else {
          return !(target.min_value < val && target.max_value > val);
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
    return "";
  };

  return (
    <>
      <tr className={getRowStatus(measurementResults)}>
        <td>
          <i
            className={"fa ms-2 " + (isExpanded ? "fa-chevron-down" : "fa-chevron-right")}
            style={{ cursor: "pointer" }}
            onClick={toggleExpand}
          />
        </td>
        {/* parts */}
        <td>
          {isLoading ? (
            <Placeholder animation="glow" as="div" className="d-flex flex-wrap gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Placeholder key={i} style={{ width: "4.5rem", height: "1.5rem", borderRadius: "3px" }} />
              ))}
            </Placeholder>
          ) : (
            <MeasurementResultsBadges
              requirement={requirement}
              step={step}
              measurementResults={measurementResults}
              parts={parts}
              stepParts={runStepParts}
            />
          )}
        </td>

        {/* misc status elements */}
        <td>
          <Badge bg="info">requirement</Badge>
          {step.amount_of_files > 0 && (
            <span>
              <i className="fa fa-paperclip" /> {step.amount_of_files}
            </span>
          )}
          {step.has_remark && <i className="fa fa-comment-o text-warning" />}
        </td>

        {/* step */}
        <td className={step.has_step_group ? "ps-4" : ""}>
          <div>
            ({step.number}){" "}
            <Link to={`/${environment}/operator/run/step/${step.id}`}>
              <span
                dangerouslySetInnerHTML={{
                  __html: step.name,
                }}
              />
            </Link>{" "}
          </div>
        </td>

        {/* equipment */}
        <td>
          <Link to={`/${environment}/operator/equipment/${stepModule.equipment.id}`} className="me-2">
            {stepModule.equipment.name}
          </Link>
          <ModuleStatusElement
            module={stepModule}
            refetchFn={() => {
              refetchFn(["runSteps"]);
            }}
          />
        </td>
      </tr>

      {/* Details parts*/}
      {isExpanded && (
        <tr>
          <td colSpan={parts.length + 5}>
            {isLoading ? (
              "Loading..."
            ) : (
              <RequirementDetails
                requirement={requirement}
                step={step}
                stepParts={runStepParts}
                parts={parts}
                measurementResults={measurementResults}
                refetchFn={reloadQueriesByKey}
              />
            )}
          </td>
        </tr>
      )}
    </>
  );
}
