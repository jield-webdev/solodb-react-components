import React, { useState } from "react";
import { Button } from "react-bootstrap";
import RunStepPartComment from "@/modules/run/components/step/view/element/parts/element/runStepPartComment";
import { RunStepPart, setRunStepPartAction as SetRunStepPartAction } from "solodb-typescript-core";
import { RunStepPartActionEnum } from "solodb-typescript-core";

const RunStepPartTableRow = ({
  runStepPart,
  editable = true,
  reloadFn,
}: {
  runStepPart: RunStepPart;
  editable?: boolean;
  reloadFn?: () => void;
}) => {
  //Create a state for the runStepPart (and avoid name conflicts with the prop)
  const [runStepPartState, setRunStepPart] = useState<RunStepPart>(runStepPart);

  const isProcessed = runStepPartState.latest_action?.type.id === RunStepPartActionEnum.FINISH_PROCESSING;
  const isFailed = runStepPartState.latest_action?.type.id === RunStepPartActionEnum.FAILED_PROCESSING;

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

  if (runStepPart.part_processing_failed_in_previous_step) {
    return (
      <tr className={"table-danger"}>
        <td>
          {runStepPart.part.short_label}
          {runStepPart.part.label && runStepPart.part.label.trim().length > 0 ? ` (${runStepPart.part.label})` : ""}
        </td>
        <td colSpan={editable ? 3 : 2}>
          <span>Processing failed in a previous step</span>
        </td>
        <td>
          <RunStepPartComment runStepPart={runStepPart} setRunStepPart={setRunStepPart} />
        </td>
      </tr>
    );
  }

  return (
    <tr className={isProcessed ? "table-success" : isFailed ? "table-danger" : ""}>
      <td>
        {runStepPartState.part.short_label}
        {runStepPartState.part.label && runStepPartState.part.label.trim().length > 0
          ? ` (${runStepPartState.part.label})`
          : ""}
      </td>
      <td className={"text-center"}>{runStepPartState.latest_action?.type.name}</td>
      {editable && (
        <td className={"text-center"}>
          <div className={" d-flex gap-2 justify-content-center"}>
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
                onClick={() =>
                  setRunStepPartAction({
                    runStepPart: runStepPartState,
                    runStepPartAction: RunStepPartActionEnum.REWORK,
                  })
                }
                className={"btn-info btn-sm"}
              >
                Rework
              </Button>
            )}
          </div>
        </td>
      )}
      <td>
        <RunStepPartComment editable={editable} runStepPart={runStepPart} setRunStepPart={setRunStepPart} />
      </td>
    </tr>
  );
};

export default RunStepPartTableRow;
