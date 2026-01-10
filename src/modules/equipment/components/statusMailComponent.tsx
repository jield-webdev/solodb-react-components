import React, { useContext, useEffect, useState } from "react";
import { useQueries, useQueryClient } from "@tanstack/react-query";
import { Alert } from "react-bootstrap";
import { StatusMailContext } from "@/modules/equipment/contexts/statusMailContext";
import StatusMailEquipmentElement from "@/modules/equipment/components/status-mail/statusMailEquipmentElement";
import StatusMailMessageElement from "@/modules/equipment/components/status-mail/statusMailMessageElement";
import IssueTable from "@/modules/equipment/components/partial/issueTable";
import SendStatusMailButton from "@/modules/equipment/components/partial/sendStatusMail";
import { Equipment, listEquipment, listModules, listEcn, listIssues, listLocationMessages, listEcnAttachments, listIssueAttachments, listReservations, ClassificationsOptionEnum } from "@jield/solodb-typescript-core";

export default function StatusMailComponent() {
  let { statusMail } = useContext(StatusMailContext);
  const [equipmentList, setEquipmentList] = useState<Equipment[]>([]);

  const queryClient = useQueryClient();

  //Fetch the details of the status mail
  const queries = useQueries({
    queries: [
      {
        queryKey: ["equipment", "status_mail", JSON.stringify(statusMail.filter)],
        queryFn: () => listEquipment({ statusMail: statusMail }),
      },
      {
        queryKey: ["module", "status_mail", JSON.stringify(statusMail.filter)],
        queryFn: () => listModules({ statusMail: statusMail }),
      },
      {
        queryKey: ["ecn", "status_mail", JSON.stringify(statusMail.filter)],
        queryFn: () => listEcn({ statusMail: statusMail }),
      },
      {
        queryKey: ["issue", "status_mail", JSON.stringify(statusMail.filter)],
        queryFn: () => listIssues({ statusMail: statusMail }),
      },
      {
        queryKey: ["messages", "status_mail", JSON.stringify(statusMail.filter)],
        queryFn: () => listLocationMessages({ statusMail: statusMail }),
      },
      {
        queryKey: ["ecn", "attachment", "status_mail", JSON.stringify(statusMail.filter)],
        queryFn: () => listEcnAttachments({ statusMail: statusMail }),
      },
      {
        queryKey: ["issue", "attachment", "status_mail", JSON.stringify(statusMail.filter)],
        queryFn: () => listIssueAttachments({ statusMail: statusMail }),
      },
      {
        queryKey: ["reservation", "active", "status_mail", JSON.stringify(statusMail.filter)],
        queryFn: () => listReservations({ which: "active" }),
      },
      {
        queryKey: ["reservation", "upcoming", "status_mail", JSON.stringify(statusMail.filter)],
        queryFn: () => listReservations({ which: "upcoming" }),
      },
    ],
  });

  const reloadQueriesByKey = (key: any[]) => {
    let finalKeys = key;
    finalKeys.push(JSON.stringify(statusMail.filter));
    queryClient.refetchQueries({ queryKey: finalKeys });
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

    // Sort the equipment list
    equipmentList.sort((a, b) => {
      if (statusMail.classification === ClassificationsOptionEnum.ROOM) {
        return a.room.name.localeCompare(b.room.name);
      } else if (statusMail.classification === ClassificationsOptionEnum.AREA) {
        return a.area.localeCompare(b.area);
      } else if (statusMail.classification === ClassificationsOptionEnum.AREA_PER_FACILITY) {
        return a.facility.localeCompare(b.facility) || a.area.localeCompare(b.area);
      }
      return 0;
    });

    // Render the equipment list with headers
    let lastFacility = "";
    let lastArea = "";
    let lastRoom = "";
    return equipmentList.map((equipment, index) => {
      const components = [];

      // Add headers conditionally based on classification
      if (statusMail.classification === ClassificationsOptionEnum.ROOM) {
        if (equipment.room.name !== lastRoom) {
          components.push(<h2 key={`room-${equipment.room.name}`}>Room: {equipment.room.name}</h2>);
          lastRoom = equipment.room.name;
        }
      } else if (statusMail.classification === ClassificationsOptionEnum.AREA) {
        if (equipment.area !== lastArea) {
          components.push(<h2 key={`area-${equipment.area}`}>Area: {equipment.area}</h2>);
          lastArea = equipment.area;
        }
      } else if (statusMail.classification === ClassificationsOptionEnum.AREA_PER_FACILITY) {
        if (equipment.facility !== lastFacility) {
          components.push(<h2 key={`facility-${equipment.facility}`}>Facility: {equipment.facility}</h2>);
          lastFacility = equipment.facility;
        }
        if (equipment.area !== lastArea) {
          components.push(<h4 key={`area-${equipment.area}`}>Area: {equipment.area}</h4>);
          lastArea = equipment.area;
        }
      }

      // Add the equipment element
      components.push(
        <StatusMailEquipmentElement
          key={index}
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
