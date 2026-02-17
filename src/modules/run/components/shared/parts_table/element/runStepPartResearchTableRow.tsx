import React, { useEffect, useState } from "react";
import { Badge, Button } from "react-bootstrap";
import RunStepPartComment from "@jield/solodb-react-components/modules/run/components/shared/parts_table/element/runStepPartComment";
import { RunStepPart, setRunStepPartAction as SetRunStepPartAction } from "@jield/solodb-typescript-core";
import { RunStepPartActionEnum } from "@jield/solodb-typescript-core";

const RunStepPartResearchTableRow = ({
  runStepPart,
  editable = true,
  reloadFn,
  partIsSelected,
  setPartAsSelected,
}: {
  runStepPart: RunStepPart;
  editable?: boolean;
  reloadFn?: () => void;
  partIsSelected?: boolean;
  setPartAsSelected?: (partID: number) => void;
}) => {
  //Create a state for the runStepPart (and avoid name conflicts with the prop)
  const [runStepPartState, setRunStepPart] = useState<RunStepPart>(runStepPart);

  useEffect(() => {
    setRunStepPart(runStepPart);
  }, [runStepPart]);

  const isProcessed = runStepPartState.latest_action?.type.id === RunStepPartActionEnum.FINISH_PROCESSING;
  const isFailed = runStepPartState.latest_action?.type.id === RunStepPartActionEnum.FAILED_PROCESSING;
  const cellClassName = runStepPartState.part_processing_failed_in_previous_step
    ? "table-danger"
    : isProcessed
      ? "table-success"
      : isFailed
        ? "table-danger"
        : "";

  const statusMeta = (() => {
    if (runStepPartState.part_processing_failed_in_previous_step) {
      return { label: "Blocked", variant: "danger", description: "Failed in previous step" };
    }
    if (runStepPartState.actions === 0) {
      return { label: "Not started", variant: "secondary", description: "No actions yet" };
    }
    if (runStepPartState.latest_action?.type.id === RunStepPartActionEnum.START_PROCESSING) {
      return { label: "In progress", variant: "primary", description: "Processing started" };
    }
    if (runStepPartState.latest_action?.type.id === RunStepPartActionEnum.FINISH_PROCESSING) {
      return { label: "Completed", variant: "success", description: "Processing finished" };
    }
    if (runStepPartState.latest_action?.type.id === RunStepPartActionEnum.FAILED_PROCESSING) {
      return { label: "Failed", variant: "danger", description: "Processing failed" };
    }
    if (runStepPartState.latest_action?.type.id === RunStepPartActionEnum.REWORK) {
      return { label: "Rework", variant: "warning", description: "Needs rework" };
    }
    return { label: "Unknown", variant: "secondary", description: "No status available" };
  })();

  const partLabel = `${runStepPartState.part.short_label}${
    runStepPartState.part.label && runStepPartState.part.label.trim().length > 0
      ? ` (${runStepPartState.part.label})`
      : ""
  }`;

  const handleRowClick = (event: React.MouseEvent<HTMLTableRowElement>) => {
    if (!setPartAsSelected) {
      return;
    }

    const target = event.target as HTMLElement;
    if (target.closest("button, a, input, textarea, select, option, label")) {
      return;
    }

    setPartAsSelected(runStepPartState.id);
  };

  const setRunStepPartAction = ({
    runStepPart,
    runStepPartAction,
  }: {
    runStepPart: RunStepPart;
    runStepPartAction: RunStepPartActionEnum;
  }) => {
    SetRunStepPartAction({ runStepPart, runStepPartAction })
      .then((response) => {
        setRunStepPart({
          ...runStepPart,
          ...{
            latest_action: response,
            actions: runStepPart.actions + 1,
          },
        });
      })
      .then(() => {
        if (reloadFn) {
          reloadFn();
        }
      });
  };

  return (
    <tr onClick={handleRowClick} style={editable ? { cursor: "pointer" } : undefined}>
      <td className={cellClassName}></td>
      <td>
        <div className={"d-flex align-items-center gap-2"}>
          {partLabel}
          {setPartAsSelected && (
            <input
              type="checkbox"
              id={`part-select-${runStepPart.id}`}
              name="tomato"
              className={"form-check-input m-0"}
              checked={partIsSelected}
              onChange={() => {
                setPartAsSelected(runStepPart.id);
              }}
            />
          )}
        </div>
      </td>
      <td>
        <div className={"d-flex justify-content-between gap-1"}>
          <div>
            <Badge bg={statusMeta.variant}>{statusMeta.label}</Badge>
            <small className={"text-muted ms-2"}>{statusMeta.description}</small>
          </div>

          {editable && (
            <div className={"d-flex gap-1"}>
              {runStepPartState.actions === 0 && (
                <Button
                  onClick={() =>
                    setRunStepPartAction({
                      runStepPart: runStepPartState,
                      runStepPartAction: RunStepPartActionEnum.START_PROCESSING,
                    })
                  }
                  className={"btn-success btn-sm"}
                >
                  Start
                </Button>
              )}
              {runStepPartState.actions > 0 &&
                runStepPartState.latest_action?.type.id !== RunStepPartActionEnum.FINISH_PROCESSING &&
                runStepPartState.latest_action?.type.id !== RunStepPartActionEnum.FAILED_PROCESSING && (
                  <Button
                    onClick={() =>
                      setRunStepPartAction({
                        runStepPart: runStepPartState,
                        runStepPartAction: RunStepPartActionEnum.FINISH_PROCESSING,
                      })
                    }
                    className={"btn-primary btn-sm"}
                  >
                    Finish
                  </Button>
                )}
              {runStepPartState.actions > 0 &&
                runStepPartState.latest_action?.type.id !== RunStepPartActionEnum.FINISH_PROCESSING &&
                runStepPartState.latest_action?.type.id !== RunStepPartActionEnum.FAILED_PROCESSING && (
                  <Button
                    onClick={() =>
                      setRunStepPartAction({
                        runStepPart: runStepPartState,
                        runStepPartAction: RunStepPartActionEnum.FAILED_PROCESSING,
                      })
                    }
                    className={"btn-danger btn-sm"}
                  >
                    Failed
                  </Button>
                )}
              {runStepPartState.actions > 0 && (
                <Button
                  size={"sm"}
                  onClick={() =>
                    setRunStepPartAction({
                      runStepPart: runStepPartState,
                      runStepPartAction: RunStepPartActionEnum.REWORK,
                    })
                  }
                >
                  Rework
                </Button>
              )}
            </div>
          )}
        </div>
      </td>
      <td>
        <RunStepPartComment editable={editable} runStepPart={runStepPart} setRunStepPart={setRunStepPart} />
      </td>
    </tr>
  );
};

export default RunStepPartResearchTableRow;
