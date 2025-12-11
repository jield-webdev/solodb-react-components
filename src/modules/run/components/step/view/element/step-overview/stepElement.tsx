import React, { useContext, useState } from "react";
import { RunStep } from "@/modules/run/interfaces/runStep";
import { Badge, OverlayTrigger, Tooltip } from "react-bootstrap";
import StepDetails from "@/modules/run/components/step/view/element/step-overview/stepDetails";
import { Link, useParams } from "react-router-dom";
import DateFormat from "@/modules/partial/dateFormat";
import { RunStepContext } from "@/modules/run/contexts/runStepContext";
import { PartsBadgesResearchRun } from "@/modules/run/components/shared/parts/partsBadgesResearchRun";
import { RunPart } from "@/modules/run/interfaces/run/runPart";
import { RunStepPart } from "@/modules/run/interfaces/step/runStepPart";
import { Requirement } from "@/modules/run/interfaces/requirement";
import { Run } from "@/modules/run/interfaces/run";

const StepElement = ({
  run,
  monitoredBy,
  runStep,
  runParts,
  runStepParts,
  hideLabel,
  firstInGroup,
}: {
  run: Run;
  monitoredBy: Requirement | undefined;
  runStep: RunStep;
  runParts: RunPart[];
  runStepParts: RunStepPart[];
  hideLabel?: boolean;
  firstInGroup: boolean;
}) => {
  const { environment } = useParams();
  const [showStepDetail, setShowStepDetail] = useState<boolean>(false);

  const { runStep: contextRunStep } = useContext(RunStepContext);

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

      <tr>
        <td className={runStep.has_step_group ? "ps-4" : ""}>
          {runStep.id !== contextRunStep.id && (
            <i
              className={"fa " + (showStepDetail ? "fa-chevron-down" : "fa-chevron-right")}
              style={{ cursor: "pointer" }}
              onClick={() => {
                setShowStepDetail(!showStepDetail);
              }}
            />
          )}
          {runStep.id === contextRunStep.id && (
            <i
              className={"fa fa-chevron-right text-success"}
              style={{ cursor: "pointer" }}
              title={"This step is currently running"}
            />
          )}
        </td>
        <td>
          <PartsBadgesResearchRun step={runStep} parts={runParts} stepParts={runStepParts} />
        </td>
        <td>
          {runStep.number} {runStep.is_skipped && <Badge bg={"info"}>Skipped</Badge>}
        </td>
        <td>
          <Link
            to={`/${environment}/operator/run/step/${runStep.id}`}
            dangerouslySetInnerHTML={{ __html: runStep.name }}
          />{" "}
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
        </td>

        <td>{runStep.finish_user ? runStep.finish_user.initials : ""}</td>
        <td>{runStep.has_rework ? <span className={"badge bg-primary"}>Rework</span> : ""}</td>
        <td>{runStep.is_finished ? <DateFormat format={"DD-MM-YYYY"}>{runStep.finish_date!}</DateFormat> : ""}</td>
      </tr>

      {showStepDetail && <StepDetails run={run} runStep={runStep} showOnlyEmphasizedParameters={false} />}
    </>
  );
};

export default StepElement;
