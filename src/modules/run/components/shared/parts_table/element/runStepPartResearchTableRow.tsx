import React, { useEffect, useState } from "react";
import { Badge, Button } from "react-bootstrap";
import { useQueryClient } from "@tanstack/react-query";
import RunStepPartComment from "@jield/solodb-react-components/modules/run/components/shared/parts_table/element/runStepPartComment";
import { performRunStepPartAction, RunStepPart, RunStepPartActionEnum } from "@jield/solodb-typescript-core";
import { updateRunStepPartCache } from "@jield/solodb-react-components/modules/run/utils/runStepPartCache";

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
  const queryClient = useQueryClient();
  const [rowRunStepPart, setRowRunStepPart] = useState<RunStepPart>(runStepPart);

  useEffect(() => {
    setRowRunStepPart(runStepPart);
  }, [runStepPart]);

  const isProcessed = rowRunStepPart.latest_action?.type.id === RunStepPartActionEnum.FINISH_PROCESSING;
  const isFailed = rowRunStepPart.latest_action?.type.id === RunStepPartActionEnum.FAILED_PROCESSING;
  const cellClassName = rowRunStepPart.part_processing_failed_in_previous_step
    ? "table-danger"
    : isProcessed
      ? "table-success"
      : isFailed
        ? "table-danger"
        : "";

  const statusMeta = (() => {

    if (rowRunStepPart.part.part_processing_failed) {
      return { label: "Blocked", variant: "danger", description: "Failed in an other step" };
    }
    if (rowRunStepPart.part_processing_failed_in_previous_step) {
      return { label: "Blocked", variant: "danger", description: "Failed in previous step" };
    }
    if (rowRunStepPart.actions === 0) {
      return { label: "Not started", variant: "secondary", description: "No actions yet" };
    }
    if (rowRunStepPart.latest_action?.type.id === RunStepPartActionEnum.START_PROCESSING) {
      return { label: "In progress", variant: "primary", description: "Processing started" };
    }
    if (rowRunStepPart.latest_action?.type.id === RunStepPartActionEnum.FINISH_PROCESSING) {
      return { label: "Completed", variant: "success", description: "Processing finished" };
    }
    if (rowRunStepPart.latest_action?.type.id === RunStepPartActionEnum.FAILED_PROCESSING) {
      return { label: "Failed", variant: "danger", description: "Processing failed" };
    }
    if (rowRunStepPart.latest_action?.type.id === RunStepPartActionEnum.REWORK) {
      return { label: "Rework", variant: "warning", description: "Needs rework" };
    }
    return { label: "Unknown", variant: "secondary", description: "No status available" };
  })();

  const partLabel = rowRunStepPart.part.label ?? rowRunStepPart.part.short_label;

  const handleRowClick = (event: React.MouseEvent<HTMLTableRowElement>) => {
    if (!setPartAsSelected) {
      return;
    }

    const target = event.target as HTMLElement;
    if (target.closest("button, a, input, textarea, select, option, label")) {
      return;
    }

    setPartAsSelected(rowRunStepPart.part.id);
  };

  const setRunStepPartAction = async ({
    runStepPart,
    runStepPartAction,
  }: {
    runStepPart: RunStepPart;
    runStepPartAction: RunStepPartActionEnum;
  }) => {
    const latestAction = (await performRunStepPartAction(
      runStepPart,
      runStepPartAction
    )) as RunStepPart["latest_action"];
    setRowRunStepPart((current) => ({
      ...current,
      latest_action: latestAction,
      actions: current.actions + 1,
    }));
    updateRunStepPartCache(queryClient, {
      runStepPart: rowRunStepPart,
      action: runStepPartAction,
      latestAction,
    });
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
              id={`part-select-${rowRunStepPart.id}`}
              name="tomato"
              className={"form-check-input m-0"}
              checked={partIsSelected}
              onChange={() => {
                setPartAsSelected(rowRunStepPart.part.id);
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
              {rowRunStepPart.actions === 0 && (
                <Button
                  onClick={() =>
                    setRunStepPartAction({
                      runStepPart: rowRunStepPart,
                      runStepPartAction: RunStepPartActionEnum.START_PROCESSING,
                    })
                  }
                  className={"btn-success btn-sm"}
                >
                  Start
                </Button>
              )}
              {rowRunStepPart.actions > 0 &&
                rowRunStepPart.latest_action?.type.id !== RunStepPartActionEnum.FINISH_PROCESSING &&
                rowRunStepPart.latest_action?.type.id !== RunStepPartActionEnum.FAILED_PROCESSING && (
                  <Button
                    onClick={() =>
                      setRunStepPartAction({
                        runStepPart: rowRunStepPart,
                        runStepPartAction: RunStepPartActionEnum.FINISH_PROCESSING,
                      })
                    }
                    className={"btn-primary btn-sm"}
                  >
                    Finish
                  </Button>
                )}
              {rowRunStepPart.actions > 0 &&
                rowRunStepPart.latest_action?.type.id !== RunStepPartActionEnum.FINISH_PROCESSING &&
                rowRunStepPart.latest_action?.type.id !== RunStepPartActionEnum.FAILED_PROCESSING && (
                  <Button
                    onClick={() =>
                      setRunStepPartAction({
                        runStepPart: rowRunStepPart,
                        runStepPartAction: RunStepPartActionEnum.FAILED_PROCESSING,
                      })
                    }
                    className={"btn-danger btn-sm"}
                  >
                    Failed
                  </Button>
                )}
              {rowRunStepPart.actions > 0 &&
                rowRunStepPart.latest_action?.type.id !== RunStepPartActionEnum.FINISH_PROCESSING && (
                  <Button
                    size={"sm"}
                    onClick={() =>
                      setRunStepPartAction({
                        runStepPart: rowRunStepPart,
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
          runStepPart={rowRunStepPart}
          setRunStepPart={(nextRunStepPart) => {
            setRowRunStepPart(nextRunStepPart);
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
