import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Equipment, getEquipment } from "solodb-typescript-core";

export const useEquipment = () => {
  const [equipment, setEquipment] = useState<Equipment | null>(null);
  const { id } = useParams();
  //Grab the id from the params
  useEffect(() => {
    if (equipment === null) {
      getEquipment({ id: parseInt(id!) }).then(setEquipment);
    }
  }, [id, equipment]);

  //Create a reload feature
  function reloadEquipment() {
    getEquipment({ id: parseInt(id!) }).then(setEquipment);
  }

  return { equipment, setEquipment, reloadEquipment };
};
