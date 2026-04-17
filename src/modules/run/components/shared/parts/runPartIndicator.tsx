import { Button, Overlay, OverlayTrigger, Tooltip } from "react-bootstrap";
import axios from "axios";
import { useQueryClient } from "@tanstack/react-query";
import {
  performRunStepPartAction,
  RunPart,
  RunStep,
  RunStepPart,
  RunStepPartActionEnum,
  RunStepPartState,
  RunStepPartStateEnum,
} from "@jield/solodb-typescript-core";
import {
  updateRunStepPartCacheByRunStep,
  upsertRunStepPartCache,
} from "@jield/solodb-react-components/modules/run/utils/runStepPartCache";
import { useRef, useState } from "react";
import RunPartProductionActionsButtons from "../parts_table/element/runPartProductionActionsButtons";
import React from "react";

const RunPartIndicator = ({
  runPart,
  stepPart,
  statusClass,
  withTrayCell = false,
  allowCreate = false,
  isSelected = false,
  runStep,
}: {
  runPart: RunPart | null;
  stepPart?: RunStepPart;
  statusClass?: string;
  withTrayCell?: boolean;
  allowCreate?: boolean;
  isSelected?: boolean;
  runStep?: RunStep;
}) => {
  const queryClient = useQueryClient();

  const hasStepPart = stepPart?.id !== undefined;

  const [showPartActions, setShowPartActions] = useState(false);

  const target = useRef(null);
  const hideTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const openActions = () => {
    if (hideTimeout.current) {
      clearTimeout(hideTimeout.current);
      hideTimeout.current = null;
    }
    setShowPartActions(true);
  };

  const scheduleHideActions = () => {
    if (hideTimeout.current) clearTimeout(hideTimeout.current);
    hideTimeout.current = setTimeout(() => setShowPartActions(false), 150);
  };

  const createRunStepPart = () => {
    if (!runPart || !runStep) return;
    axios
      .post("/create/run/step/part", {
        run_part_id: runPart.id,
        run_step_id: runStep.id,
      })
      .then((response) => {
        const nextStepPart = { ...response.data } as RunStepPart;
        upsertRunStepPartCache(queryClient, runStep, nextStepPart);
      });
  };

  const doRunStepPartAction = async ({
    runStepPart: targetStepPart,
    runStepPartAction,
  }: {
    runStepPart: RunStepPart;
    runStepPartAction: RunStepPartActionEnum;
  }) => {
    const latestAction: RunStepPartState = await performRunStepPartAction({
      runStepPart: targetStepPart,
      // NOTE: the core library currently types this param as `RunStepPartStateEnum`
      // even though `available_actions` entries are `RunStepPartActionEnum`.
      // The numeric value is sent as-is to the backend, so this cast is safe until
      // the core library's typing is corrected.
      runStepPartAction: runStepPartAction as unknown as RunStepPartStateEnum,
    });

    if (!runStep) return;

    updateRunStepPartCacheByRunStep(queryClient, runStep, {
      runStepPart: targetStepPart,
      latestAction,
    });
  };

  const badgeContent = (() => {
    if (!hasStepPart) return null;
    if (!runPart) return null;
    if (allowCreate && !hasStepPart) {
      return (
        <Button
          size="sm"
          variant="outline-secondary"
          className="tray-grid__badge tray-grid__badge--init"
          onClick={createRunStepPart}
        >
          Init {runPart.scanner_label}
        </Button>
      );
    }

    const badgeClassName = `tray-grid__badge ${statusClass ?? "step-part-inactive"}${
      isSelected ? " step-part-selected" : ""
    }`;

    return <span className={badgeClassName}>{runPart.scanner_label}</span>;
  })();

  if (!withTrayCell) return badgeContent;

  return (
    <React.Fragment>
      <div
        ref={target}
        onMouseEnter={openActions}
        onMouseLeave={scheduleHideActions}
        onClick={() => (showPartActions ? scheduleHideActions() : openActions())}
        className={`tray-grid__cell${runPart ? "" : " tray-grid__cell--empty"}`}
      >
        {badgeContent}
      </div>
      {stepPart && (
        <Overlay target={target.current} show={showPartActions} placement="top">
          {({
            placement: _placement,
            arrowProps: _arrowProps,
            show: _show,
            popper: _popper,
            hasDoneInitialMeasure: _hasDoneInitialMeasure,
            ...props
          }) => (
            <div
              {...props}
              onMouseEnter={openActions}
              onMouseLeave={scheduleHideActions}
              style={{
                position: "absolute",
                backgroundColor: "rgba(33, 37, 41, 0.95)",
                padding: "12px 16px",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                borderRadius: 6,
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
                display: "flex",
                alignItems: "center",
                gap: 4,
                whiteSpace: "nowrap",
                ...props.style,
              }}
            >
              <RunPartProductionActionsButtons runStepPart={stepPart} setRunStepPartAction={doRunStepPartAction} />
            </div>
          )}
        </Overlay>
      )}
    </React.Fragment>
  );
};

export default RunPartIndicator;
