import { useEffect, useState } from "react";
import { RunStep } from "@/modules/run/interfaces/runStep";
import GetRunStep from "@/modules/run/api/getRunStep";
import { useParams } from "react-router-dom";
import { Run } from "@/modules/run/interfaces/run";
import GetRun from "@/modules/run/api/getRun";

export const useRunStep = () => {
  const [runStep, setRunStep] = useState<RunStep | null>(null);
  const [run, setRun] = useState<Run | null>(null);
  const { id } = useParams();

  //Grab the id from the params
  useEffect(() => {
    if (runStep === null || id !== runStep.id.toString()) {
      GetRunStep({ id: parseInt(id!) })
        .then((runStep) => {
          GetRun({ id: runStep.run_id }).then(setRun);

          return runStep;
        })
        .then(setRunStep);
    }
  }, [id, runStep]);

  //Create a reload feature
  function reloadRunStep() {
    GetRunStep({ id: parseInt(id!) })
      .then((runStep) => {
        GetRun({ id: runStep.run_id }).then(setRun);

        return runStep;
      })
      .then(setRunStep);
  }

  return { run, runStep, setRunStep, reloadRunStep };
};
