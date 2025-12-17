import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Run, getRun } from "solodb-typescript-core";

export const useRun = () => {
  const [run, setRun] = useState<Run | null>(null);
  const { id } = useParams();
  //Grab the id from the params
  useEffect(() => {
    if (run === null || id !== run.id.toString()) {
      getRun({ id: parseInt(id!) }).then(setRun);
    }
  }, [id, run]);

  //Create a reload feature
  function reloadRun() {
    getRun({ id: parseInt(id!) }).then(setRun);
  }

  return { run, reloadRun };
};
