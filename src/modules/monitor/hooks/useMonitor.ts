import { useEffect, useState } from "react";
import { Monitor } from "@/modules/monitor/interfaces/monitor";
import GetMonitor from "@/modules/monitor/api/getMonitor";
import { useParams } from "react-router-dom";

export const useMonitor = () => {
  const [monitor, setMonitor] = useState<Monitor | null>(null);
  const { id } = useParams();

  //Grab the id from the params
  useEffect(() => {
    if (monitor === null) {
      GetMonitor({ id: parseInt(id!) }).then(setMonitor);
    }
  }, [id, monitor]);

  //Create a reload feature
  function reloadMonitor() {
    GetMonitor({ id: parseInt(id!) }).then(setMonitor);
  }

  return { monitor, setMonitor, reloadMonitor };
};
