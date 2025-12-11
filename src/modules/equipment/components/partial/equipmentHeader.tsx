import Moment from "react-moment";
import React, { useContext } from "react";
import { EquipmentContext } from "@/modules/equipment/contexts/equipmentContext";
import { useQueries } from "@tanstack/react-query";
import ListReservations from "@/modules/equipment/api/module/listReservations";
import ListModules from "@/modules/equipment/api/module/listModules";
import ModuleStatusElement from "@/modules/equipment/components/partial/moduleStatusElement";

export default function EquipmentHeader() {
  const { equipment } = useContext(EquipmentContext);

  const queries = useQueries({
    queries: [
      {
        queryKey: ["activeReservationQuery", equipment],
        queryFn: () => ListReservations({ equipment: equipment, which: "active" }),
      },
      {
        queryKey: ["upcomingReservationQuery", equipment],
        queryFn: () =>
          ListReservations({
            equipment: equipment,
            which: "upcoming",
          }),
      },
      {
        queryKey: ["modules", equipment],
        queryFn: () => ListModules({ equipment: equipment }),
      },
    ],
  });

  const [activeReservationQuery, upcomingReservationQuery, moduleQuery] = queries;

  //Show a loading screen as long as one of the queries is still loading
  //Create a derived state to keep track of loading state
  const isLoading = queries.some((query) => query.isLoading);
  const isError = queries.some((query) => query.isError);
  const dataAvailable = queries.every((query) => query.isSuccess);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  const mainTool = moduleQuery.data?.items.findLast((module) => module.type.is_main_tool);

  return (
    dataAvailable && (
      <div className={"d-flex align-items-center justify-content-between mb-3"}>
        <h1 className={"display-4"}>{equipment.name} Operator Dashboard</h1>

        <div>
          {activeReservationQuery.data?.items.map((reservation, i) => {
            return (
              <div
                className={"mx-2 p-2 rounded border-danger"}
                key={i}
                style={{
                  backgroundColor: reservation.color,
                }}
              >
                <i className="fa fa-calendar-o text-white pe-2" aria-hidden="true"></i>
                Active reservation
                <br />
                Until <Moment format={"DD-MM-YY HH:mm"}>{reservation.end}</Moment> by {reservation.user.full_name}
              </div>
            );
          })}

          {upcomingReservationQuery.data?.items.map((reservation, i) => {
            return (
              <div
                className={"mx-2 p-2 rounded border-success border-2"}
                key={i}
                style={{
                  backgroundColor: reservation.color,
                }}
              >
                <i className="fa fa-calendar-o text-white pe-2" aria-hidden="true"></i>
                Next reservation
                <br />
                <Moment format={"DD-MM-YY HH:mm"}>{reservation.start}</Moment>
                <br />
                {reservation.user.full_name}
              </div>
            );
          })}
        </div>
      </div>
    )
  );
}
