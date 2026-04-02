import React, { useEffect, useState } from "react";
import axios from "axios";
import { useQueryClient } from "@tanstack/react-query";
import {
  RunStepPartActionEnum,
  RunPart,
  RunStepPart,
  RunStep,
  performRunStepPartAction,
  RunStepPartAction,
} from "@jield/solodb-typescript-core";
import RunStepPartComment from "@jield/solodb-react-components/modules/run/components/shared/parts_table/element/runStepPartComment";
import RunPartProductionActionsDropdown from "@jield/solodb-react-components/modules/run/components/shared/parts_table/element/runPartProductionActionsDropdown";
import RunPartProductionActionsButtons from "@jield/solodb-react-components/modules/run/components/shared/parts_table/element/runPartProductionActionsButtons";
import { upsertRunStepPartCache, updateRunStepPartCacheByRunStep } from "@jield/solodb-react-components/modules/run/utils/runStepPartCache";

type Props = {
  runPart: RunPart;
  partIsSelected?: boolean;
  setPartAsSelected?: (partID: number) => void;
  runStepParts: RunStepPart[];
  canInit: boolean;
  runStep: RunStep;
  dropdown: boolean;
};

/** Returns true when the click target is an interactive element that should swallow the event. */
const isInteractiveElement = (target: HTMLElement): boolean =>
  !!target.closest("button, a, input, textarea, select, option, label");

const RunStepPartProductionTableRow = ({
  runPart,
  partIsSelected,
  setPartAsSelected,
  runStepParts,
  canInit,
  runStep,
  dropdown,
}: Props) => {
  const [runStepPart, setRunStepPart] = useState<RunStepPart | undefined>();

  const queryClient = useQueryClient();

  // Sync runStepPart from a parent list
  useEffect(() => {
    const match = runStepParts.find((sp) => sp.part_id === runPart.id);
    setRunStepPart(match);
  }, [runStepParts, runPart.id]);

  const handleRowClick = (event: React.MouseEvent<HTMLTableRowElement>) => {
    if (!setPartAsSelected) return;

    const target = event.target as HTMLElement;
    if (isInteractiveElement(target)) return;

    const partId = runStepPart ? runStepPart.part_id : runPart.id;
    if (partId !== undefined) {
      setPartAsSelected(partId);
    }
  };

  const createRunStepPart = () => {
    if (canInit) return;

    axios
      .post("/create/run/step/part", {
        run_part_id: runPart.id,
        run_step_id: runStep.id,
      })
      .then((response) => {
        const nextStepPart = { ...response.data } as RunStepPart;
        setRunStepPart(nextStepPart);
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
    const latestAction: RunStepPartAction = await performRunStepPartAction(targetStepPart, runStepPartAction, runStep);

    setRunStepPart((current) => {
      if (!current) return current;

      const { status, processed, failed, started } = latestAction.updated_run_step_part_status;

      return {
        ...current,
        latest_action: latestAction,
        actions: current.actions + 1,
        status,
        processed,
        failed,
        started,
      };
    });

    updateRunStepPartCacheByRunStep(queryClient, runStep, {
      runStepPart: targetStepPart,
      action: runStepPartAction,
      latestAction,
    });
  };

  if (!runStepPart) return null;

  return (
    <tr onClick={handleRowClick} style={setPartAsSelected ? { cursor: "pointer" } : undefined}>
      {/* Selection checkbox */}
      <td>
        {setPartAsSelected && (
          <input
            type="checkbox"
            id={`part-select-${runStepPart.part_id}`}
            name="tomato"
            className="form-check-input"
            checked={partIsSelected}
            onChange={() => setPartAsSelected?.(runStepPart.part_id)}
          />
        )}
      </td>

      {/* Scanner label */}
      <td>{runPart.scanner_label}</td>

      {/* Status badge */}
      <td>
        <div className="d-flex align-items-start gap-1">
          <span className={`badge ${runStepPart.status.class ?? ""}`.trim()}>{runStepPart.status.key}</span>
          <small className="text-muted">{runStepPart.status.text}</small>
        </div>
      </td>

      {/* Action buttons / dropdown */}
      <td>
        {dropdown ? (
          <RunPartProductionActionsDropdown
            runStepPart={runStepPart}
            setRunStepPartAction={doRunStepPartAction}
            createRunStepPart={createRunStepPart}
          />
        ) : (
          <RunPartProductionActionsButtons runStepPart={runStepPart} setRunStepPartAction={doRunStepPartAction} />
        )}
      </td>

      {/* Comment */}
      <td>
        <RunStepPartComment runStepPart={runStepPart} setRunStepPart={setRunStepPart} />
      </td>
    </tr>
  );
};

export default RunStepPartProductionTableRow;
