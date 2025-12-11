import axios from "axios";
import { createSearchParams } from "react-router-dom";
import { ApiFormattedResponse, ApiResponse } from "@/modules/core/interfaces/response";
import { EquipmentStatus } from "@/modules/equipment/interfaces/equipmentStatus";

export default async function ListEquipmentStatus(): Promise<ApiFormattedResponse<EquipmentStatus>> {
  let searchParams = createSearchParams();
  let url = "list/equipment/status?" + searchParams.toString();

  const response = await axios.get<ApiResponse<EquipmentStatus>>(url);
  const { data } = response;
  return {
    items: data._embedded.items,
    amountOfPages: data.page_count,
    currentPage: data.page,
    totalItems: data.total_items,
    hasMore: data.page < data.page_count,
  };
}
