import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { RunStep, Run, getRunStep, getRun } from "solodb-typescript-core";

export const useRunStep = () => {
  const [runStep, setRunStep] = useState<RunStep | null>(null);
  const [run, setRun] = useState<Run | null>(null);
  const { id } = useParams();

  //Grab the id from the params
  useEffect(() => {
    if (runStep === null || id !== runStep.id.toString()) {
      getRunStep({ id: parseInt(id!) })
        .then((runStep) => {
          getRun({ id: runStep.run_id }).then(setRun);

          return runStep;
        })
        .then(setRunStep);
    }
  }, [id, runStep]);

  //Create a reload feature
  function reloadRunStep() {
    getRunStep({ id: parseInt(id!) })
      .then((runStep) => {
        getRun({ id: runStep.run_id }).then(setRun);

        return runStep;
      })
      .then(setRunStep);
  }

  return { run, runStep, setRunStep, reloadRunStep };
};
