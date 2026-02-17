import React, { useEffect, useState } from "react";
import { Badge, Button, Dropdown } from "react-bootstrap";
import axios from "axios";
import { useQueryClient } from "@tanstack/react-query";
import { formatDateTime } from "@jield/solodb-react-components/utils/datetime";
import RunStepPartComment from "@jield/solodb-react-components/modules/run/components/shared/parts_table/element/runStepPartComment";
import {
  RunStepPartActionEnum,
  RunPart,
  RunStepPart,
  RunStep,
  setRunStepPartAction as SetRunStepPartAction,
} from "@jield/solodb-typescript-core";

const RunStepPartProductionTableRow = ({
  runPart,
  runStepParts,
  runStep,
  refetchFn = () => {},
  partIsSelected,
  setPartAsSelected,
}: {
  runPart: RunPart;
  runStepParts: RunStepPart[];
  runStep: RunStep;
  refetchFn?: () => void;
  partIsSelected?: boolean;
  setPartAsSelected?: (partID: number) => void;
}) => {
  const [runStepPart, setRunStepPart] = useState<RunStepPart | undefined>(undefined);
  const queryClient = useQueryClient();

  useEffect(() => {
    setRunStepPart(
      runStepParts.find(
        (runStepPart: RunStepPart) => runStepPart.part.id === runPart.id && runStepPart.step.id === runStep.id
      )
    );
  }, [runStepParts, runPart, runStep]);

  const createRunStepPart = () => {
    axios
      .post("/create/run/step/part", {
        run_part_id: runPart.id,
        run_step_id: runStep.id,
      })
      .then((response) => {
        setRunStepPart({ ...response.data });

        //Invalidate the query so we can fetch the new data
        refetchFn();
        queryClient.invalidateQueries({
          queryKey: ["runSteps", "runStepParts"],
        });
      });
  };

  const handleRowClick = (event: React.MouseEvent<HTMLTableRowElement>) => {
    if (!setPartAsSelected) {
      return;
    }

    const target = event.target as HTMLElement;
    if (target.closest("button, a, input, textarea, select, option, label")) {
      return;
    }

    setPartAsSelected(runPart.id);
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
        //Invalidate the query so we can fetch the new data
        refetchFn();
        queryClient.invalidateQueries({
          queryKey: ["runSteps"],
        });
      });
  };

  if (!runStepPart) {
    return (
      <tr onClick={handleRowClick} style={{ cursor: "pointer" }} >
        <td>
          <div className={"d-flex align-items-center gap-2"}>
            <div className={"fw-semibold"}>
              Part {runPart.short_label}
              {runPart.label && runPart.label.trim().length > 0 ? ` (${runPart.label})` : ""}
            </div>
            {setPartAsSelected && (
              <input
                type="checkbox"
                id={`part-select-${runPart.id}`}
                name="tomato"
                className={"form-check-input m-0"}
                checked={partIsSelected}
                onChange={() => {
                  setPartAsSelected(runPart.id);
                }}
              />
            )}
          </div>
        </td>
        <td>
          <div className={"d-flex flex-column align-items-start gap-1"}>
            <Badge bg={"secondary"}>Not initialized</Badge>
            <small className={"text-muted"}>No actions yet</small>
          </div>
        </td>
        <td className={"text-muted"}>-</td>
        <td>
          <Button size={"sm"} variant={"outline-info"} onClick={() => createRunStepPart()}>
            Init
          </Button>
        </td>
        <td></td>
      </tr>
    );
  }

  const isProcessed = runStepPart.latest_action?.type.id === RunStepPartActionEnum.FINISH_PROCESSING;
  const isFailed = runStepPart.latest_action?.type.id === RunStepPartActionEnum.FAILED_PROCESSING;
  const rowClassName = runStepPart.part_processing_failed_in_previous_step
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

  return (
    <tr onClick={handleRowClick} style={{ cursor: "pointer" }}  className={rowClassName}>
      <td>
        <div className={"d-flex align-items-center gap-2"}>
          <div className={"fw-semibold"}>
            Part {runStepPart.part.short_label}
            {runStepPart.part.label && runStepPart.part.label.trim().length > 0 ? ` (${runStepPart.part.label})` : ""}
          </div>
          {setPartAsSelected && (
            <>
              <input
                type="checkbox"
                id={`part-select-${runStepPart.part.id}`}
                name="tomato"
                className={"form-check-input m-0"}
                checked={partIsSelected}
                onChange={() => {
                  setPartAsSelected(runPart.id);
                }}
              />
              <label className={"visually-hidden"} htmlFor={`part-select-${runStepPart.part.id}`}>
                Select part
              </label>
            </>
          )}
        </div>
      </td>
      <td>
        <div className={"d-flex flex-column align-items-start gap-1"}>
          <Badge bg={statusMeta.variant}>{statusMeta.label}</Badge>
          <small className={"text-muted"}>{statusMeta.description}</small>
        </div>
      </td>
      <td>
        <span className={"text-muted"}>
          {formatDateTime(runStepPart.latest_action?.date_created, "DD-MM-YY HH:mm")}
        </span>
      </td>
      <td>
        <Dropdown align="end">
          <Dropdown.Toggle size="sm" variant="outline-secondary">
            Actions
          </Dropdown.Toggle>
          <Dropdown.Menu>
            {runStepPart.actions === 0 && (
              <Dropdown.Item
                onClick={() =>
                  setRunStepPartAction({
                    runStepPart: runStepPart,
                    runStepPartAction: RunStepPartActionEnum.START_PROCESSING,
                  })
                }
              >
                Start
              </Dropdown.Item>
            )}
            {runStepPart.actions > 0 &&
              runStepPart.latest_action?.type.id !== RunStepPartActionEnum.FINISH_PROCESSING &&
              runStepPart.latest_action?.type.id !== RunStepPartActionEnum.FAILED_PROCESSING && (
                <Dropdown.Item
                  onClick={() =>
                    setRunStepPartAction({
                      runStepPart: runStepPart,
                      runStepPartAction: RunStepPartActionEnum.FINISH_PROCESSING,
                    })
                  }
                >
                  Finish
                </Dropdown.Item>
              )}
            {runStepPart.actions > 0 &&
              runStepPart.latest_action?.type.id !== RunStepPartActionEnum.FINISH_PROCESSING &&
              runStepPart.latest_action?.type.id !== RunStepPartActionEnum.FAILED_PROCESSING && (
                <Dropdown.Item
                  onClick={() =>
                    setRunStepPartAction({
                      runStepPart: runStepPart,
                      runStepPartAction: RunStepPartActionEnum.FAILED_PROCESSING,
                    })
                  }
                >
                  Failed
                </Dropdown.Item>
              )}
            {runStepPart.actions > 0 && (
              <Dropdown.Item
                onClick={() =>
                  setRunStepPartAction({
                    runStepPart: runStepPart,
                    runStepPartAction: RunStepPartActionEnum.REWORK,
                  })
                }
              >
                Rework
              </Dropdown.Item>
            )}
          </Dropdown.Menu>
        </Dropdown>
      </td>
      <td>
        <RunStepPartComment runStepPart={runStepPart} setRunStepPart={setRunStepPart} />
      </td>
    </tr>
  );
};

export default RunStepPartProductionTableRow;
