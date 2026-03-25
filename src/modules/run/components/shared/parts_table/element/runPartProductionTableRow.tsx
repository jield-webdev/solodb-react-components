import React, { useEffect, useState } from "react";
import axios from "axios";
import { useQueryClient } from "@tanstack/react-query";
import { formatDateTime } from "@jield/solodb-react-components/utils/datetime";
import RunStepPartComment from "@jield/solodb-react-components/modules/run/components/shared/parts_table/element/runStepPartComment";
import RunPartProductionActionsDropdown from "@jield/solodb-react-components/modules/run/components/shared/parts_table/element/runPartProductionActionsDropdown";
import {
  performRunStepPartAction,
  RunStepPartActionEnum,
  RunPart,
  RunStepPart,
  RunStep,
} from "@jield/solodb-typescript-core";
import { updateRunStepPartCache } from "@jield/solodb-react-components/modules/run/utils/runStepPartCache";
import RunPartProductionActionsButtons from "@jield/solodb-react-components/modules/run/components/shared/parts_table/element/runPartProductionActionsButtons";
import { Alert } from "react-bootstrap";

type Props = {
  runPart: RunPart;
  partIsSelected?: boolean;
  setPartAsSelected?: (partID: number) => void;
  runStepParts: RunStepPart[];
  canInit: boolean;
  runStep: RunStep;
  refetchFn?: () => void;
  dropdown: boolean;
  onRunStepPartUpdated?: (runStepPart: RunStepPart) => void;
};

const RunStepPartProductionTableRow = (props: Props) => {
  const queryClient = useQueryClient();
  const refetchFn = props.refetchFn ?? (() => {});
  const [runStepPart, setRunStepPart] = useState<RunStepPart | undefined>();

  useEffect(() => {
    const match = props.runStepParts.find((sp) => sp.part.id === props.runPart.id);
    setRunStepPart(match);
  }, []);

  const handleRowClick = (event: React.MouseEvent<HTMLTableRowElement>) => {
    if (!props.setPartAsSelected) {
      return;
    }

    const target = event.target as HTMLElement;
    if (target.closest("button, a, input, textarea, select, option, label")) {
      return;
    }

    const partId = runStepPart ? runStepPart.part.id : props.runPart.id;
    if (partId !== undefined) {
      props.setPartAsSelected(partId);
    }
  };

  const createRunStepPart = () => {
    if (props.canInit) {
      return;
    }

    const { runPart, runStep, onRunStepPartUpdated } = props as Props;
    axios
      .post("/create/run/step/part", {
        run_part_id: runPart.id,
        run_step_id: runStep.id,
      })
      .then((response) => {
        const nextStepPart = { ...response.data } as RunStepPart;
        setRunStepPart(nextStepPart);
        if (onRunStepPartUpdated) {
          onRunStepPartUpdated(nextStepPart);
        }

        //Invalidate the query so we can fetch the new data
        refetchFn();
        queryClient.invalidateQueries({
          queryKey: ["runSteps", "runStepParts"],
        });
      });
  };

  const setRunStepPartAction = async ({
    runStepPart: targetStepPart,
    runStepPartAction,
  }: {
    runStepPart: RunStepPart;
    runStepPartAction: RunStepPartActionEnum;
  }) => {
    const latestAction = (await performRunStepPartAction(
      targetStepPart,
      runStepPartAction
    )) as RunStepPart["latest_action"];

    setRunStepPart((current) => {
      if (!current) {
        return current;
      }
      const updatedStepPart = {
        ...current,
        latest_action: latestAction,
        actions: current.actions + 1,
      };
      updateRunStepPartCache(queryClient, {
        runStepPart: updatedStepPart,
        action: runStepPartAction,
        latestAction,
      });
      const { onRunStepPartUpdated } = props as Props;
      if (onRunStepPartUpdated) {
        onRunStepPartUpdated(updatedStepPart);
      }
      return updatedStepPart;
    });

    refetchFn();
    queryClient.invalidateQueries({
      queryKey: ["runSteps"],
    });
  };

  const onRunStepPartUpdated = (nextStepPart: RunStepPart) => {
    setRunStepPart(nextStepPart);
    const { onRunStepPartUpdated: onUpdated } = props as Props;
    if (onUpdated) {
      onUpdated(nextStepPart);
    }
  };

  if (!runStepPart) {
    return null;
  }

  return (
    <tr onClick={handleRowClick} style={props.setPartAsSelected ? { cursor: "pointer" } : undefined}>
      <td>
        {props.setPartAsSelected && (
          <input
            type="checkbox"
            id={`part-select-${runStepPart.part.id}`}
            name="tomato"
            className={"form-check-input"}
            checked={props.partIsSelected}
            onChange={() => {
              props.setPartAsSelected?.(runStepPart.part.id);
            }}
          />
        )}
      </td>
      <td>{props.runPart.label || props.runPart.short_label}</td>
      <td>
        <div className={"d-flex align-items-start gap-1"}>
          <span className={`badge ${runStepPart.status.class ?? ""}`.trim()}>{runStepPart.status.key}</span>
          <small className={"text-muted"}>{runStepPart.status.text}</small>
        </div>
      </td>
      <td>
        {props.dropdown && (
          <RunPartProductionActionsDropdown
            runStepPart={runStepPart}
            setRunStepPartAction={setRunStepPartAction}
            createRunStepPart={createRunStepPart}
          />
        )}
        {!props.dropdown && (
          <RunPartProductionActionsButtons runStepPart={runStepPart} setRunStepPartAction={setRunStepPartAction} />
        )}
      </td>
      <td>
        <RunStepPartComment runStepPart={runStepPart} setRunStepPart={onRunStepPartUpdated} />
      </td>
      <td>
        <small className={"text-muted font-monospace"}>
          id: {runStepPart.id}
          <br />
          level: {props.runStep.part_level}
          <br />
          label: {runStepPart.part.label}
          <br />
          short_label: {runStepPart.part.short_label}<br />
          tray: {runStepPart.part.tray.id} ({runStepPart.part.tray.label})<br />
          tray_column: {runStepPart.part.tray_column} | tray_row: {runStepPart.part.tray_row}
        </small>
      </td>
    </tr>
  );
};

export default RunStepPartProductionTableRow;
