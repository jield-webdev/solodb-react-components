import { RunPart } from "@/modules/run/interfaces/run/runPart";
import { RunStepPart } from "@/modules/run/interfaces/step/runStepPart";
import React, { useEffect, useState } from "react";
import { RunStep } from "@/modules/run/interfaces/runStep";
import { Badge, Button } from "react-bootstrap";
import axios from "axios";
import { RunStepPartActionEnum } from "@/modules/run/enum/runStepPartActionEnum";
import SetRunStepPartAction from "@/modules/run/api/step/part/setRunStepPartAction";

export default function RunPartStepPart({
  runPart,
  runStepParts,
  runStep,
}: {
  runPart: RunPart;
  runStepParts: RunStepPart[];
  runStep: RunStep;
}) {
  const [runStepPart, setRunStepPart] = useState<RunStepPart | undefined>(undefined);

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
      });
  };

  const setRunStepPartAction = ({
    runStepPart,
    runStepPartAction,
  }: {
    runStepPart: RunStepPart;
    runStepPartAction: RunStepPartActionEnum;
  }) => {
    SetRunStepPartAction({ runStepPart, runStepPartAction }).then((response) => {
      setRunStepPart({
        ...runStepPart,
        ...{
          latest_action: response,
          actions: runStepPart.actions + 1,
        },
      });
    });
  };

  if (!runStepPart) {
    return (
      <Button size={"sm"} variant={"outline-info"} onClick={() => createRunStepPart()}>
        Init
      </Button>
    );
  }

  if (runStepPart.latest_action?.type.id === RunStepPartActionEnum.FAILED_PROCESSING) {
    return (
      <>
        <Badge bg={"danger"}>Failed</Badge>
        <div className={"d-flex gap-2 mt-2"}>
          <i
            onClick={() =>
              setRunStepPartAction({
                runStepPart: runStepPart,
                runStepPartAction: RunStepPartActionEnum.REWORK,
              })
            }
            className={"fa fa-rotate-right text-primary"}
          ></i>
        </div>
      </>
    );
  }

  if (runStepPart.latest_action?.type.id === RunStepPartActionEnum.FINISH_PROCESSING) {
    return <Badge bg={"success"}>Processed</Badge>;
  }

  if (runStepPart.latest_action?.type.id === RunStepPartActionEnum.REWORK) {
    return (
      <>
        <Badge bg={"info"}>Reworked</Badge>
        <div className={"d-flex gap-2 mt-2"}>
          <i
            onClick={() =>
              setRunStepPartAction({
                runStepPart: runStepPart,
                runStepPartAction: RunStepPartActionEnum.FINISH_PROCESSING,
              })
            }
            className={"fa fa-check-circle-o text-success"}
          ></i>
          <i
            onClick={() =>
              setRunStepPartAction({
                runStepPart: runStepPart,
                runStepPartAction: RunStepPartActionEnum.FAILED_PROCESSING,
              })
            }
            className={"fa fa-exclamation-circle text-danger"}
          ></i>
        </div>
      </>
    );
  }

  if (runStepPart.actions === 0) {
    return (
      <Button
        size={"sm"}
        variant={"info"}
        onClick={() =>
          setRunStepPartAction({
            runStepPart: runStepPart,
            runStepPartAction: RunStepPartActionEnum.START_PROCESSING,
          })
        }
      >
        Start
      </Button>
    );
  }

  return (
    <>
      <Badge bg={"info"}>Started</Badge>
      <div className={"d-flex gap-2 mt-2"}>
        <i
          onClick={() =>
            setRunStepPartAction({
              runStepPart: runStepPart,
              runStepPartAction: RunStepPartActionEnum.FINISH_PROCESSING,
            })
          }
          className={"fa fa-check-circle-o text-success"}
        ></i>
        <i
          onClick={() =>
            setRunStepPartAction({
              runStepPart: runStepPart,
              runStepPartAction: RunStepPartActionEnum.FAILED_PROCESSING,
            })
          }
          className={"fa fa-exclamation-circle text-danger"}
        ></i>
        <i
          onClick={() =>
            setRunStepPartAction({
              runStepPart: runStepPart,
              runStepPartAction: RunStepPartActionEnum.REWORK,
            })
          }
          className={"fa fa-rotate-right text-primary"}
        ></i>
      </div>
    </>
  );
}
