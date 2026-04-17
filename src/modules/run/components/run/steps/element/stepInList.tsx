import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import ModuleStatusElement from "@jield/solodb-react-components/modules/equipment/components/partial/moduleStatusElement";
import StepDetails from "@jield/solodb-react-components/modules/run/components/run/steps/element/stepDetails";
import { OverlayTrigger, Placeholder, Tooltip } from "react-bootstrap";
import {
  Run,
  RunStep,
  RunPart,
  RunStepPart,
  Requirement,
  EquipmentModule,
  listRunStepParts,
} from "@jield/solodb-typescript-core";
import { RunPartList } from "@jield/solodb-react-components/modules/run/components/shared/parts/runPartList";
import { keepPreviousData, useQueries } from "@tanstack/react-query";


//runStepParts

export default function StepInList({
  run,
  step,
  parts,
  monitoredBy,
  refetchFn,
}: {
  run: Run;
  step: RunStep;
  parts: RunPart[];
  monitoredBy: Requirement | undefined;
  refetchFn: (key: any[]) => void;
}) {
  const { environment } = useParams();
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const [stepModule, setStepModule] = useState<EquipmentModule>(step.process_module.module);

  // Update stepModule when step.process_module.module changes
  useEffect(() => {
    setStepModule(step.process_module.module);
  }, [step.process_module.module]);

  const queries = useQueries({
    queries: [
      {
        queryKey: ["runStepParts", step.id],
        queryFn: () => listRunStepParts({ step }),
        placeholderData: keepPreviousData,
      },
    ],
  });

  const [runStepPartsQuery] = queries;

  const runStepParts = useMemo(() => (runStepPartsQuery.data?.items ?? []) as RunStepPart[], [runStepPartsQuery.data?.items]);

  return (
    <>
      <tr>
        <td>
          <i
            className={"fa ms-2 " + (isExpanded ? "fa-chevron-down" : "fa-chevron-right")}
            style={{ cursor: "pointer" }}
            onClick={toggleExpand}
          />
        </td>
        <td
          className={
            stepModule.latest_module_status && stepModule.latest_module_status.status.is_down_status
              ? "table-danger"
              : ""
          }
        >
          {runStepPartsQuery.isLoading ? (
            <Placeholder animation="glow" as="div" className="d-flex flex-wrap gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Placeholder key={i} style={{ width: "4.5rem", height: "1.5rem", borderRadius: "3px" }} />
              ))}
            </Placeholder>
          ) : (
            <RunPartList step={step} parts={parts} stepParts={runStepParts} run={run} />
          )}
        </td>
        <td>
          {monitoredBy && (
            <OverlayTrigger
              placement="top"
              overlay={
                <Tooltip id={`tooltip-${monitoredBy.id}`}>{`Monitored by step: ${monitoredBy.step.number}`}</Tooltip>
              }
            >
              <i className="fa fa-search me-2"></i>
            </OverlayTrigger>
          )}
          {step.amount_of_files > 0 && (
            <span>
              <i className="fa fa-paperclip" /> {step.amount_of_files}
            </span>
          )}
          {step.has_remark && <i className="fa fa-comment-o text-warning me-3"></i>}

          {step.is_finished && <i className="fa fa-check text-success me-3"></i>}
        </td>

        {/* step */}
        <td className={step.has_step_group ? "ps-4" : ""}>
          {step.number}
          {" - "}
          <Link to={`/${environment}/operator/run/step/${step.id}`}>
            <span
              dangerouslySetInnerHTML={{
                __html: step.name,
              }}
            />
          </Link>{" "}
        </td>
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
      {isExpanded && (
        <tr>
          <td colSpan={parts.length + 6}>
            <StepDetails step={step} refetchFn={refetchFn} />
          </td>
        </tr>
      )}
    </>
  );
}
