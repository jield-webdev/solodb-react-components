import React, { useContext, useEffect, useState } from "react";
import { useQueries, useQueryClient } from "@tanstack/react-query";
import { Alert } from "react-bootstrap";
import { StatusMailContext } from "@jield/solodb-react-components/modules/equipment/contexts/statusMailContext";
import StatusMailEquipmentElement from "@jield/solodb-react-components/modules/equipment/components/status-mail/statusMailEquipmentElement";
import StatusMailMessageElement from "@jield/solodb-react-components/modules/equipment/components/status-mail/statusMailMessageElement";
import IssueTable from "@jield/solodb-react-components/modules/equipment/components/partial/issueTable";
import SendStatusMailButton from "@jield/solodb-react-components/modules/equipment/components/partial/sendStatusMail";
import {
  Equipment,
  listEquipment,
  listModules,
  listEcn,
  listIssues,
  listLocationMessages,
  listEcnAttachments,
  listIssueAttachments,
  listReservations,
  ClassificationsOptionEnum,
  Area,
  Facility,
} from "@jield/solodb-typescript-core";

export default function StatusMailComponent() {
  let { statusMail } = useContext(StatusMailContext);
  const [equipmentList, setEquipmentList] = useState<Equipment[]>([]);

  const queryClient = useQueryClient();

  //Fetch the details of the status mail
  const queries = useQueries({
    queries: [
      {
        queryKey: ["equipment", "status_mail", statusMail.id],
        queryFn: () => listEquipment({ statusMail: statusMail }),
      },
      {
        queryKey: ["module", "status_mail", statusMail.id],
        queryFn: () => listModules({ statusMail: statusMail }),
      },
      {
        queryKey: ["ecn", "status_mail", statusMail.id],
        queryFn: () => listEcn({ statusMail: statusMail }),
      },
      {
        queryKey: ["issue", "status_mail", statusMail.id],
        queryFn: () => listIssues({ statusMail: statusMail }),
      },
      {
        queryKey: ["messages", "status_mail", statusMail.id],
        queryFn: () => listLocationMessages({ statusMail: statusMail }),
      },
      {
        queryKey: ["ecn", "attachment", "status_mail", statusMail.id],
        queryFn: () => listEcnAttachments({ statusMail: statusMail }),
      },
      {
        queryKey: ["issue", "attachment", "status_mail", statusMail.id],
        queryFn: () => listIssueAttachments({ statusMail: statusMail }),
      },
      {
        queryKey: ["reservation", "active", "status_mail", statusMail.id],
        queryFn: () => listReservations({ which: "active", pageSize: 1000 }),
      },
      {
        queryKey: ["reservation", "upcoming", "status_mail", statusMail.id],
        queryFn: () => listReservations({ which: "upcoming", pageSize: 1000 }),
      },
    ],
  });

  const reloadQueriesByKey = (key: any[]) => {
    queryClient.refetchQueries({ queryKey: [...key, statusMail.id] });
  };

  const [
    equipmentQuery,
    moduleQuery,
    ecnQuery,
    issueQuery,
    messageQuery,
    ecnAttachmentQuery,
    issueAttachmentQuery,
    reservationActiveQuery,
    reservationUpcomingQuery,
  ] = queries;

  //Create a derived state to keep track of loading state
  const isLoading = queries.some((query) => query.isLoading);
  const isError = queries.some((query) => query.isError);
  const dataAvailable = queries.every((query) => query.isSuccess);

  useEffect(() => {
    if (!dataAvailable) return;

    setEquipmentList(equipmentQuery.data!.items);
  }, [dataAvailable]);

  // Render logic for grouped headers
  const renderEquipmentList = () => {
    if (!equipmentList.length) return <p>No equipment available.</p>;

    // Sort the equipment list (copy first to avoid mutating state in place)
    const sortedEquipmentList = [...equipmentList].sort((a, b) => {
      if (statusMail.classification === ClassificationsOptionEnum.ROOM) {
        return (a.room?.name ?? "").localeCompare(b.room?.name ?? "");
      } else if (a.area && b.area && statusMail.classification === ClassificationsOptionEnum.AREA) {
        return a.area.title.localeCompare(b.area.title);
      } else if (a.area && b.area && statusMail.classification === ClassificationsOptionEnum.AREA_PER_FACILITY) {
        return a.area.facility.title.localeCompare(b.area.facility.title) || a.area.title.localeCompare(b.area.title);
      }
      return 0;
    });

    // Render the equipment list with headers
    let lastFacility: Facility | null = null;
    let lastArea: Area | null = null;
    let lastRoom = "";
    return sortedEquipmentList.map((equipment) => {
      const components = [];

      // Add headers conditionally based on classification
      if (statusMail.classification === ClassificationsOptionEnum.ROOM) {
        const roomName = equipment.room?.name ?? "";
        if (roomName !== lastRoom) {
          components.push(<h2 key={`room-${roomName}`}>Room: {roomName}</h2>);
          lastRoom = roomName;
        }
      } else if (statusMail.classification === ClassificationsOptionEnum.AREA) {
        if (equipment.area && equipment.area.id !== lastArea?.id) {
          components.push(<h2 key={`area-${equipment.area.id}`}>Area: {equipment.area.title}</h2>);
          lastArea = equipment.area;
        }
      } else if (statusMail.classification === ClassificationsOptionEnum.AREA_PER_FACILITY) {
        if (equipment.area && equipment.area.facility.id !== lastFacility?.id) {
          components.push(
            <h2 key={`facility-${equipment.area.facility.id}`}>Facility: {equipment.area.facility.title}</h2>
          );
          lastFacility = equipment.area.facility;
        }
        if (equipment.area && equipment.area.id !== lastArea?.id) {
          components.push(<h4 key={`area-${equipment.area.id}`}>Area: {equipment.area.title}</h4>);
          lastArea = equipment.area;
        }
      }

      // Add the equipment element
      components.push(
        <StatusMailEquipmentElement
          key={equipment.id}
          equipment={equipment}
          modules={moduleQuery.data!.items}
          issues={issueQuery.data!.items}
          issueAttachments={issueAttachmentQuery.data!.items}
          ecnNotes={ecnQuery.data!.items}
          ecnAttachments={ecnAttachmentQuery.data!.items}
          reloadQueryFn={reloadQueriesByKey}
          showIssues={statusMail.show_issues}
          reservations={
            statusMail.show_reservations
              ? reservationActiveQuery.data!.items.concat(reservationUpcomingQuery.data!.items)
              : []
          }
        />
      );

      return components;
    });
  };

  const renderIssuesWithPriority = () => {
    const issues = issueQuery.data!.items.filter((i) => i.issue_type === 2);
    if (issues.length === 0) {
      return <></>;
    }
    return (
      <>
        <h2>Issues with priority</h2>
        <IssueTable
          issues={issues}
          modules={moduleQuery.data!.items}
          issueAttachments={issueAttachmentQuery.data!.items}
          reloadQueryFn={reloadQueriesByKey}
        />
      </>
    );
  };

  return (
    <>
      <div className={"d-flex justify-content-between align-items-center"}>
        <h1 className={"display-4"}>Status mail {statusMail.name}</h1>
        <div>
          <SendStatusMailButton statusMail={statusMail} />
        </div>
      </div>
      <p>{statusMail.subject}</p>

      {isLoading && <Alert variant={"info"}>Loading status mail</Alert>}
      {isError && <Alert variant={"danger"}>Error loading status mail</Alert>}

      {dataAvailable && statusMail.show_issues_with_priority && renderIssuesWithPriority()}
      {dataAvailable && messageQuery.data && (
        <StatusMailMessageElement messageList={messageQuery.data.items} refetchFn={messageQuery.refetch} />
      )}
      {dataAvailable && renderEquipmentList()}
    </>
  );
}
