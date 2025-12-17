import { useQueries } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Alert, Table } from "react-bootstrap";
import { Service } from "solodb-typescript-core";

export default function ListEquipmentReport() {
  const { id } = useParams<{ id: string }>();
  const [serviceList, setServiceList] = useState<Service[]>([]);

  const queries = useQueries({
    queries: [
      {
        queryKey: ["service", "equipment", id],
        queryFn: () => listService({ equipmentId: Number(id) }),
      },
    ],
  });

  const [servicesQuery] = queries;

  const isLoading = queries.some((q) => q.isLoading);
  const isError = queries.some((q) => q.isError);
  const dataAvailable = queries.every((q) => q.isSuccess);

  useEffect(() => {
    if (!dataAvailable) return;
    setServiceList(servicesQuery.data!.items);
  }, [dataAvailable, servicesQuery.data]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isError) {
    return <div>Error loading services.</div>;
  }

  // Helper function to format duration
  const formatDuration = (minutes: number): string => {
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes > 0 ? `${remainingMinutes}min` : ""}`.trim();
  };

  if (servicesQuery.data!.items.length === 0) {
    return (
      <div>
        <h2>Services</h2>
        <Alert variant={"info"}>No services found</Alert>
      </div>
    );
  }

  return (
    <div>
      <h2>Services</h2>
      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>Id</th>
            <th>Name</th>
            <th>Type</th>
            <th>Team</th>
            <th>Department</th>
            <th>Duration</th>
            <th>Report2</th>
          </tr>
        </thead>
        <tbody>
          {serviceList.map((svc) => (
            <tr key={svc.id}>
              <td>{svc.id}</td>
              <td>
                <a href={`/${window.location.pathname.split("/")[1]}/service/details/${svc.id}/general.html`}>
                  {svc.name}
                </a>
              </td>
              <td>{svc.type?.name || "N/A"}</td>
              <td>{svc.team?.name || "N/A"}</td>
              <td>{svc.department?.name || "N/A"}</td>
              <td>{formatDuration(svc.minutes_needed_for_service)}</td>
              <td>
                {svc.latest_event_report_id && (
                  <a
                    className={"btn btn-primary btn-sm"}
                    href={`/${window.location.pathname.split("/")[1]}/service/event/report/${svc.latest_event_report_id}/results`}
                  >
                    View Report
                  </a>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
}
