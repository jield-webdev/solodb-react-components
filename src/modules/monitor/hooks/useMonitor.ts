import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getMonitor, Monitor } from "@jield/solodb-typescript-core";

export const useMonitor = () => {
  const [monitor, setMonitor] = useState<Monitor | null>(null);
  const { id } = useParams();

  //Grab the id from the params
  useEffect(() => {
    if (monitor === null) {
      getMonitor({ id: parseInt(id!) }).then(setMonitor);
    }
  }, [id, monitor]);

  //Create a reload feature
  function reloadMonitor() {
    getMonitor({ id: parseInt(id!) }).then(setMonitor);
  }

  return { monitor, setMonitor, reloadMonitor };
};
