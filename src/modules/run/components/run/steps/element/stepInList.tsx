import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import ModuleStatusElement from "@jield/solodb-react-components/modules/equipment/components/partial/moduleStatusElement";
import StepDetails from "@jield/solodb-react-components/modules/run/components/run/steps/element/stepDetails";
import { PartsBadgesResearchRun } from "@jield/solodb-react-components/modules/run/components/shared/parts/partsBadgesResearchRun";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { PartBadgesProductionRun } from "@jield/solodb-react-components/modules/run/components/shared/parts/partsBadgesProductionRun";
import { Run, RunStep, RunPart, RunStepPart, Requirement, EquipmentModule, RunTypeEnum } from "@jield/solodb-typescript-core";

export default function StepInList({
  run,
  step,
  parts,
  stepParts,
  monitoredBy,
  refetchFn,
}: {
  run: Run;
  step: RunStep;
  parts: RunPart[];
  stepParts: RunStepPart[];
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

  return (
    <>
      <tr>
        {/* toggle */}
        <td>
          <i
            className={"fa ms-2 " + (isExpanded ? "fa-chevron-down" : "fa-chevron-right")}
            style={{ cursor: "pointer" }}
            onClick={toggleExpand}
          />
        </td>

        {/* parts */}
        <td
          className={
            stepModule.latest_module_status && stepModule.latest_module_status.status.is_down_status
              ? "table-danger"
              : ""
          }
        >
          {run.run_type === RunTypeEnum.RESEARCH && (
            <PartsBadgesResearchRun step={step} parts={parts} stepParts={stepParts} />
          )}
          {run.run_type === RunTypeEnum.PRODUCTION && (
            <PartBadgesProductionRun
              runStep={step}
              parts={parts}
              runStepParts={stepParts}
              reloadFn={() => {
                refetchFn(["runStepParts"]);
              }}
            />
          )}
        </td>

        {/* misc status elements */}
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
          <td colSpan={parts.length + 6}>
            <StepDetails step={step} stepParts={stepParts} parts={parts} refetchFn={refetchFn} />
          </td>
        </tr>
      )}
    </>
  );
}
