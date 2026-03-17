import React, { useContext, useState } from "react";
import { Badge, OverlayTrigger, Tooltip } from "react-bootstrap";
import StepDetails from "@jield/solodb-react-components/modules/run/components/step/view/element/step-overview/stepDetails";
import { Link, useParams } from "react-router-dom";
import DateFormat from "@jield/solodb-react-components/modules/partial/dateFormat";
import { RunStepContext } from "@jield/solodb-react-components/modules/run/contexts/runStepContext";
import { RunPartList } from "@jield/solodb-react-components/modules/run/components/shared/parts/runPartList";
import { Requirement, Run, RunPart, RunStep, RunStepPart } from "@jield/solodb-typescript-core";

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
        className={`d-flex flex-wrap align-items-center gap-3 border rounded px-3 py-2 ${
          runStep.has_step_group ? "ms-4" : ""
        }`}
      >
        <div className="d-flex align-items-center gap-2 flex-shrink-0">
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
        </div>
        <div className="d-flex flex-wrap align-items-center gap-3 flex-grow-1 min-w-0">
          <div className="flex-shrink-0">
            <RunPartList step={runStep} parts={runParts} stepParts={runStepParts} run={run} />
          </div>
          <div className="flex-shrink-0 text-nowrap">
            {runStep.number} {runStep.is_skipped && <Badge bg={"info"}>Skipped</Badge>}
          </div>
          <div className="flex-grow-1 min-w-0">
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

      {showStepDetail && <StepDetails run={run} runStep={runStep} showOnlyEmphasizedParameters={false} />}
    </>
  );
};

export default StepElement;
