import axios from "axios";
import { createSearchParams } from "react-router-dom";
import { EquipmentModuleReservation } from "@/modules/equipment/interfaces/equipment/module/equipmentModuleReservation";
import { ApiFormattedResponse, ApiResponse } from "@/modules/core/interfaces/response";
import { Equipment } from "@/modules/equipment/interfaces/equipment";
import { EquipmentModule } from "@/modules/equipment/interfaces/equipment/equipmentModule";

export default async function ListReservations({
  equipment,
  module,
  which,
}: {
  equipment?: Equipment;
  module?: EquipmentModule;
  which?: "active" | "past" | "upcoming";
}): Promise<ApiFormattedResponse<EquipmentModuleReservation>> {
  let searchParams = createSearchParams();

  if (equipment !== undefined) {
    searchParams.append("equipment", equipment.id.toString());
  }

  if (module !== undefined) {
    searchParams.append("module", module.id.toString());
  }

  if (which !== undefined) {
    searchParams.append("which", which);
  }

  let url = "list/equipment/reservation?" + searchParams.toString();

  const response = await axios.get<ApiResponse<EquipmentModuleReservation>>(url);
  const { data } = response;

  if (which == "active") {
    for (let i = 0; i < data._embedded.items.length; i++) {
      data._embedded.items[i].active = true;
    }
  }

  return {
    items: data._embedded.items,
    amountOfPages: data.page_count,
    currentPage: data.page,
    totalItems: data.total_items,
    hasMore: data.page < data.page_count,
  };
}
