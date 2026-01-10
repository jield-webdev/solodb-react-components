import React from "react";
import { useEquipment } from "@jield/solodb-react-components/modules/equipment/hooks/useEquipment";
import { EquipmentContext } from "@jield/solodb-react-components/modules/equipment/contexts/equipmentContext";

export default function EquipmentProvider({ children }: { children: React.ReactNode }) {
  const { equipment, reloadEquipment } = useEquipment();

  if (null === equipment) {
    return (
      <div className={"d-flex justify-content-center h-100 vh-100 flex-row align-items-center"}>
        <div className={"d-flex flex-column align-items-center"}>
          <h1>Loading Equipment</h1>
          <div className="spinner-border" style={{ width: "3rem", height: "3rem" }} role="status">
            <span className="visually-hidden">Loading equipment</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <EquipmentContext.Provider
      value={{
        equipment,
        reloadEquipment,
      }}
    >
      {children}
    </EquipmentContext.Provider>
  );
}
