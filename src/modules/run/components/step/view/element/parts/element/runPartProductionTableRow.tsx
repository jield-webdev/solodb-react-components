import { RunStepPart } from "@/modules/run/interfaces/step/runStepPart";
import { RunStepPartActionEnum } from "@/modules/run/enum/runStepPartActionEnum";
import React, { useEffect, useState } from "react";
import SetRunStepPartAction from "@/modules/run/api/step/part/setRunStepPartAction";
import { Button, Dropdown } from "react-bootstrap";
import { RunPart } from "@/modules/run/interfaces/run/runPart";
import { RunStep } from "@/modules/run/interfaces/runStep";
import axios from "axios";
import { useQueryClient } from "@tanstack/react-query";
import Moment from "react-moment";
import RunStepPartComment from "@/modules/run/components/step/view/element/parts/element/runStepPartComment";

const RunStepPartProductionTableRow = ({
  runPart,
  runStepParts,
  runStep,
  refetchFn = () => {},
}: {
  runPart: RunPart;
  runStepParts: RunStepPart[];
  runStep: RunStep;
  refetchFn?: () => void;
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
      <tr>
        <td>
          Part {runPart.short_label}
          {runPart.label && runPart.label.trim().length > 0 ? ` (${runPart.label})` : ""}
        </td>
        <td colSpan={2}></td>
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

  return (
    <tr className={isProcessed ? "table-success" : isFailed ? "table-danger" : ""}>
      <td>
        Part {runStepPart.part.short_label}
        {runStepPart.part.label && runStepPart.part.label.trim().length > 0 ? ` (${runStepPart.part.label})` : ""}
      </td>
      <td>{runStepPart.latest_action?.type.name}</td>
      <td>
        <Moment format={"DD-MM-YY HH:mm"}>{runStepPart.latest_action?.date_created}</Moment>
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
