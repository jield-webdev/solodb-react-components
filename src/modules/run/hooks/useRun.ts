import { useEffect, useState } from "react";
import { Run } from "@/modules/run/interfaces/run";
import GetRun from "@/modules/run/api/getRun";
import { useParams } from "react-router-dom";

export const useRun = () => {
  const [run, setRun] = useState<Run | null>(null);
  const { id } = useParams();
  //Grab the id from the params
  useEffect(() => {
    if (run === null || id !== run.id.toString()) {
      GetRun({ id: parseInt(id!) }).then(setRun);
    }
  }, [id, run]);

  //Create a reload feature
  function reloadRun() {
    GetRun({ id: parseInt(id!) }).then(setRun);
  }

  return { run, reloadRun };
};
