import { Table } from "react-bootstrap";
import { useParams } from "react-router-dom";
import { EquipmentModuleStatusWrapper } from "./equipmentModuleStatusWrapper";
import { Setup } from "@jield/solodb-typescript-core/dist/equipment/interfaces/setup";
import { Equipment } from "@jield/solodb-typescript-core";

export default function SelectedEquipmentTable({
  equipmentList,
  removeEquipment,
}: {
  equipmentList: Equipment[];
  removeEquipment: (equipment: Equipment) => void;
}) {
  const { environment } = useParams();

  return (
    <Table striped hover size="sm">
      <thead>
        <tr>
          <th>Number</th>
          <th>{/*Remove button*/}</th>
          <th>Status</th>
          <th>Name</th>
          <th>Types</th>
          <th>Lab</th>
          <th>Building</th>
        </tr>
      </thead>
      <tbody>
        {equipmentList.map((equipment) => (
          <tr key={equipment.id}>
            <td>
              <a href={`/${environment}/equipment/details/${equipment?.id}/general.html`}>{equipment.number}</a>
            </td>
            <td>
              <button
                onClick={() => {
                  removeEquipment(equipment);
                }}
                className="btn btn-outline-danger btn-sm me-2"
              >
                <i className="fa fa-plus"></i> Remove from setup
              </button>
            </td>
            <td>
              <EquipmentModuleStatusWrapper equipment={equipment} />
            </td>
            <td>
              <a href={`/${environment}/equipment/details/${equipment.id}/general.html`}>{equipment.name}</a>{" "}
              <a href={`/${environment}/equipment/edit/${equipment.id}.html`}>
                <i className="fa fa-pencil-square-o fa-fw" />
              </a>
            </td>
            <td>{equipment.types?.join(", ")}</td>
            <td>{equipment.room?.name}</td>
            <td>{equipment.room?.building.name}</td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
}
