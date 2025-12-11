import { useEffect, useState } from "react";
import { Equipment } from "@/modules/equipment/interfaces/equipment";
import GetEquipment from "@/modules/equipment/api/getEquipment";
import { useParams } from "react-router-dom";

export const useEquipment = () => {
  const [equipment, setEquipment] = useState<Equipment | null>(null);
  const { id } = useParams();
  //Grab the id from the params
  useEffect(() => {
    if (equipment === null) {
      GetEquipment({ id: parseInt(id!) }).then(setEquipment);
    }
  }, [id, equipment]);

  //Create a reload feature
  function reloadEquipment() {
    GetEquipment({ id: parseInt(id!) }).then(setEquipment);
  }

  return { equipment, setEquipment, reloadEquipment };
};
