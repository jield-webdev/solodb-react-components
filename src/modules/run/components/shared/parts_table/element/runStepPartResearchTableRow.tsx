import React from "react";
import { Badge, Button } from "react-bootstrap";
import RunStepPartComment from "@jield/solodb-react-components/modules/run/components/shared/parts_table/element/runStepPartComment";
import { RunStepPart, RunStepPartActionEnum } from "@jield/solodb-typescript-core";
import performRunStepPartAction from "@jield/solodb-react-components/utils/run/step/performRunStepPartAction";

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
  const isProcessed = runStepPart.latest_action?.type.id === RunStepPartActionEnum.FINISH_PROCESSING;
  const isFailed = runStepPart.latest_action?.type.id === RunStepPartActionEnum.FAILED_PROCESSING;
  const cellClassName = runStepPart.part_processing_failed_in_previous_step
    ? "table-danger"
    : isProcessed
      ? "table-success"
      : isFailed
        ? "table-danger"
        : "";

  const statusMeta = (() => {
    if (runStepPart.part_processing_failed_in_previous_step) {
      return { label: "Blocked", variant: "danger", description: "Failed in previous step" };
    }
    if (runStepPart.actions === 0) {
      return { label: "Not started", variant: "secondary", description: "No actions yet" };
    }
    if (runStepPart.latest_action?.type.id === RunStepPartActionEnum.START_PROCESSING) {
      return { label: "In progress", variant: "primary", description: "Processing started" };
    }
    if (runStepPart.latest_action?.type.id === RunStepPartActionEnum.FINISH_PROCESSING) {
      return { label: "Completed", variant: "success", description: "Processing finished" };
    }
    if (runStepPart.latest_action?.type.id === RunStepPartActionEnum.FAILED_PROCESSING) {
      return { label: "Failed", variant: "danger", description: "Processing failed" };
    }
    if (runStepPart.latest_action?.type.id === RunStepPartActionEnum.REWORK) {
      return { label: "Rework", variant: "warning", description: "Needs rework" };
    }
    return { label: "Unknown", variant: "secondary", description: "No status available" };
  })();

  const partLabel = `${runStepPart.part.short_label}${
    runStepPart.part.label && runStepPart.part.label.trim().length > 0 ? ` (${runStepPart.part.label})` : ""
  }`;

  const handleRowClick = (event: React.MouseEvent<HTMLTableRowElement>) => {
    if (!setPartAsSelected) {
      return;
    }

    const target = event.target as HTMLElement;
    if (target.closest("button, a, input, textarea, select, option, label")) {
      return;
    }

    setPartAsSelected(runStepPart.id);
  };

  const setRunStepPartAction = async ({
    runStepPart,
    runStepPartAction,
  }: {
    runStepPart: RunStepPart;
    runStepPartAction: RunStepPartActionEnum;
  }) => {
    await performRunStepPartAction(runStepPart, runStepPartAction);
    if (reloadFn) {
      reloadFn();
    }
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
              {runStepPart.actions === 0 && (
                <Button
                  onClick={() =>
                    setRunStepPartAction({
                      runStepPart: runStepPart,
                      runStepPartAction: RunStepPartActionEnum.START_PROCESSING,
                    })
                  }
                  className={"btn-success btn-sm"}
                >
                  Start
                </Button>
              )}
              {runStepPart.actions > 0 &&
                runStepPart.latest_action?.type.id !== RunStepPartActionEnum.FINISH_PROCESSING &&
                runStepPart.latest_action?.type.id !== RunStepPartActionEnum.FAILED_PROCESSING && (
                  <Button
                    onClick={() =>
                      setRunStepPartAction({
                        runStepPart: runStepPart,
                        runStepPartAction: RunStepPartActionEnum.FINISH_PROCESSING,
                      })
                    }
                    className={"btn-primary btn-sm"}
                  >
                    Finish
                  </Button>
                )}
              {runStepPart.actions > 0 &&
                runStepPart.latest_action?.type.id !== RunStepPartActionEnum.FINISH_PROCESSING &&
                runStepPart.latest_action?.type.id !== RunStepPartActionEnum.FAILED_PROCESSING && (
                  <Button
                    onClick={() =>
                      setRunStepPartAction({
                        runStepPart: runStepPart,
                        runStepPartAction: RunStepPartActionEnum.FAILED_PROCESSING,
                      })
                    }
                    className={"btn-danger btn-sm"}
                  >
                    Failed
                  </Button>
                )}
              {runStepPart.actions > 0 && (
                <Button
                  size={"sm"}
                  onClick={() =>
                    setRunStepPartAction({
                      runStepPart: runStepPart,
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
        <RunStepPartComment
          editable={editable}
          runStepPart={runStepPart}
          setRunStepPart={() => {
            if (reloadFn) {
              reloadFn();
            }
          }}
        />
      </td>
    </tr>
  );
};

export default RunStepPartResearchTableRow;
