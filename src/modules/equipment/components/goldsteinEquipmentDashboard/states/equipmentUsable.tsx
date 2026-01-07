import UpdateStatus from "../actionModules/updateStatus";
import { parseAssociation } from "@/modules/admin/functions/goldstein/parseAssociation";

interface EquipmentUsableProps {
  userName: string;
  userID: number;
  badgeUUID: string;
  clientAssociation: string;
  timeLeft: number;
}

export default function EquipmentUsable({
  userName,
  userID,
  badgeUUID,
  clientAssociation,
  timeLeft,
}: EquipmentUsableProps) {
  const [type, id] = parseAssociation(clientAssociation);

  return (
    <div className="text-center">
      <div className="alert alert-success mb-4" role="alert">
        <h1 className="h4 alert-heading">You can use the equipment</h1>
        <hr />
        <p className="mb-0" id="session-left-time">
          Session time remaining: {timeLeft}
        </p>
      </div>

      <div className="card mb-4">
        <div className="card-header bg-light-sublte">User Information</div>
        <ul className="list-group list-group-flush">
          <li className="list-group-item d-flex justify-content-between align-items-center">
            <span>User:</span>
            <span className="badge bg-primary">{userName}</span>
          </li>
          <li className="list-group-item d-flex justify-content-between align-items-center">
            <span>Badge UUID:</span>
            <code>{badgeUUID}</code>
          </li>
          <li className="list-group-item d-flex justify-content-between align-items-center">
            <span>Client Association:</span>
            <span className="badge bg-info text-dark">{clientAssociation}</span>
          </li>
        </ul>
      </div>

      <UpdateStatus userID={userID} equipmentID={type === 'equipment' ? Number(id) : -1} />
    </div>
  );
}
