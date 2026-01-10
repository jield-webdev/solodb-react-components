import React from "react";
import EquipmentProvider from "@jield/solodb-react-components/modules/equipment/providers/equipmentProvider";
import { Outlet } from "react-router-dom";
import EquipmentHeader from "@jield/solodb-react-components/modules/equipment/components/partial/equipmentHeader";

export default function EquipmentHeaderElement() {
  return (
    <EquipmentProvider>
      <EquipmentHeader />
      <Outlet />
    </EquipmentProvider>
  );
}
