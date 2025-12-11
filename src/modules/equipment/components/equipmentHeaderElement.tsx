import React from "react";
import EquipmentProvider from "@/modules/equipment/providers/equipmentProvider";
import { Outlet } from "react-router-dom";
import EquipmentHeader from "@/modules/equipment/components/partial/equipmentHeader";

export default function EquipmentHeaderElement() {
  return (
    <EquipmentProvider>
      <EquipmentHeader />
      <Outlet />
    </EquipmentProvider>
  );
}
