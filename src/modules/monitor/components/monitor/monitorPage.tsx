import React from "react";
import { useParams } from "react-router-dom";
import { useQueries } from "@tanstack/react-query";
import getMonitor from "@/modules/monitor/api/getMonitor";
import ListMonitorRequirements from "@/modules/monitor/api/listMonitorRequirements";
import RequirementResults from "@/modules/monitor/components/monitor/requirement/requirementResults";

export default function MonitorPage() {
  let { id } = useParams();

  //Fetch the details of the monitor
  const [monitorQuery, requirementQuery] = useQueries({
    queries: [
      {
        queryKey: ["monitor", id],
        queryFn: () => getMonitor({ id: parseInt(id!) }),
      },
      {
        queryKey: ["requirements", id],
        queryFn: () => ListMonitorRequirements({ monitorId: parseInt(id!) }),
      },
    ],
  });

  if (monitorQuery.isLoading) return <div>Loading...</div>;

  return (
    <div>
      <h1 className={"display-4"}>SPC Test {monitorQuery.data?.name}</h1>

      {requirementQuery.data?.items.map((requirement, key) => {
        return (
          <div className={"border border-1 p-3 my-3"} key={key}>
            <RequirementResults requirement={requirement} />
          </div>
        );
      })}
    </div>
  );
}
