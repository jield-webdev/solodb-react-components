import React, { useEffect, useState } from "react";
import { Button, Dropdown } from "react-bootstrap";
import axios from "axios";
import { useQueryClient } from "@tanstack/react-query";
import { RunStepPartActionEnum, RunPart, RunStepPart, RunStep, setRunStepPartAction as  SetRunStepPartAction } from "solodb-typescript-core";

const RunStepPartProductionBadge = ({
  runPart,
  runStepParts,
  runStep,
  reloadFn = () => {},
}: {
  runPart: RunPart;
  runStepParts: RunStepPart[];
  runStep: RunStep;
  reloadFn?: () => void;
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
        reloadFn();
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
        reloadFn();
        queryClient.invalidateQueries({
          queryKey: ["runSteps"],
        });
      });
  };

  const getBadgeStatusClass = (runPart: RunPart): string => {
    const match = runStepParts.find((sp) => sp.part.id === runPart.id && sp.step.id === runStep.id);
    if (!match) return "badge-inactive";
    if (match.part_processing_failed_in_previous_step) return "badge-failed-previous";
    if (match.failed) return "badge-failed";
    if (match.processed) return "badge-processed";
    if (match.started) return "badge-started";
    return "";
  };

  if (!runStepPart) {
    return (
      <Button
        size={"sm"}
        variant={"outline-secondary"}
        style={{ minWidth: "100px" }}
        onClick={() => createRunStepPart()}
      >
        Init {runPart.label ?? runPart.short_label}
      </Button>
    );
  }

  return (
    <div style={{ minWidth: "100px" }}>
      <Dropdown>
        <Dropdown.Toggle
          size="sm"
          variant={"outline-secondary"}
          className={"border-2 w-100 " + getBadgeStatusClass(runPart)}
        >
          Part {runStepPart.part.label ?? runStepPart.part.short_label}
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
    </div>
  );
};

export default RunStepPartProductionBadge;
