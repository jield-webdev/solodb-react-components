import React from "react";
import { useQueries } from "@tanstack/react-query";
import { Card } from "react-bootstrap";
import { Monitor } from "@/modules/monitor/interfaces/monitor";
import ListMonitorRequirements from "@/modules/monitor/api/listMonitorRequirements";
import { Link, useParams } from "react-router-dom";
import Moment from "react-moment";

export default function MonitorCard({ monitor }: { monitor: Monitor }) {
  const { environment } = useParams();

  const [requirementsQuery] = useQueries({
    queries: [
      {
        queryKey: ["requirement", monitor],
        queryFn: () => ListMonitorRequirements({ monitorId: monitor.id }),
      },
    ],
  });

  if (requirementsQuery.isLoading) return <div>Loading requirements...</div>;

  return requirementsQuery.data?.items.map((requirement, index) => {
    let className = "bg-secondary-subtle";

    //Go over the latest_result and check if there is any value_is_valid which is false, then, and only then, change the className to bg-danger-subtle
    if (requirement.latest_result) {
      for (let i = 0; i < requirement.latest_result.values.length; i++) {
        //Stop the script when we find a value that is not valid
        if (requirement.latest_result.values[i].value_is_valid === false) {
          className = "bg-danger-subtle";
          break;
        }

        if (requirement.latest_result.values[i].value_is_valid === true) {
          className = "bg-success-subtle";
          break;
        }
      }
    }

    return (
      <Card className={"mb-2 me-2"} key={index}>
        <Card.Body className={className}>
          <Card.Title>
            <Link to={`/${environment}/operator/monitor/` + monitor.id}>{monitor.name}</Link>
          </Card.Title>
          <Card.Text>
            {requirement.title}
            {requirement.latest_result && (
              <>
                Latest measurement: <Moment format={"DD-MM-YY HH:mm"}>{requirement.latest_result.date_created}</Moment>
              </>
            )}
          </Card.Text>
        </Card.Body>
      </Card>
    );
  });
}
