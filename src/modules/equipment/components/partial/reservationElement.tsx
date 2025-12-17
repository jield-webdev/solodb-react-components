import { Badge, OverlayTrigger, Tooltip } from "react-bootstrap";
import moment from "moment";
import { EquipmentModuleReservation } from "solodb-typescript-core";

export default function ReservationElement({
  reservations,
}: {
  reservations: EquipmentModuleReservation[] | undefined;
}) {
  if (!reservations || reservations.length < 1) {
    return <></>;
  }

  const currentReservation = reservations[0];

  return (
    <OverlayTrigger
      placement="top"
      overlay={
        <Tooltip id={`tooltip-${currentReservation.id}`}>
          <h5>{currentReservation.title}</h5>
          <p>
            {reservations[0].active
              ? "Currently active"
              : `Upcoming in: ${moment(reservations[0].start).format("DD MMMM YYYY")}`}
          </p>
          <p>
            {reservations[1]
              ? `Next upcoming reservation in: ${moment(reservations[1].start).format("DD MMMM YYYY")}`
              : "No next upcoming reservations"}
          </p>
        </Tooltip>
      }
    >
      <Badge bg={reservations[0].active ? "info" : "dark"}>Reserved by: {reservations[0].user.full_name}</Badge>
    </OverlayTrigger>
  );
}
