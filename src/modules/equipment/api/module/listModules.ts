import axios from "axios";
import { createSearchParams } from "react-router-dom";
import { Equipment } from "@/modules/equipment/interfaces/equipment";
import { ApiFormattedResponse, ApiResponse } from "@/modules/core/interfaces/response";
import { StatusMail } from "@/modules/equipment/interfaces/statusMail";
import { EquipmentModule } from "@/modules/equipment/interfaces/equipment/equipmentModule";
import { Run } from "@/modules/run/interfaces/run";

export default async function ListModules({
  equipment,
  statusMail,
  run,
}: {
  equipment?: Equipment;
  statusMail?: StatusMail;
  run?: Run;
}): Promise<ApiFormattedResponse<EquipmentModule>> {
  let searchParams = createSearchParams();

  if (equipment !== undefined) {
    searchParams.append("equipment", equipment.id.toString());
  }

  if (statusMail !== undefined) {
    searchParams.append("status_mail", statusMail.id.toString());
    searchParams.append("page_size", "10000");
  }

  if (run !== undefined) {
    searchParams.append("run", run.id.toString());
  }

  let url = "list/equipment/module?" + searchParams.toString();

  const response = await axios.get<ApiResponse<EquipmentModule>>(url);
  const { data } = response;
  return {
    items: data._embedded.items,
    amountOfPages: data.page_count,
    currentPage: data.page,
    totalItems: data.total_items,
    hasMore: data.page < data.page_count,
  };
}
