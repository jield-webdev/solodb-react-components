import axios from "axios";
import { createSearchParams } from "react-router-dom";
import { Monitor } from "@/modules/monitor/interfaces/monitor";
import { ApiFormattedResponse, ApiResponse } from "@/modules/core/interfaces/response";
import { Equipment } from "@/modules/equipment/interfaces/equipment";

export default async function ListMonitors({
  equipment,
}: {
  equipment?: Equipment;
}): Promise<ApiFormattedResponse<Monitor>> {
  let searchParams = createSearchParams();

  if (equipment !== undefined) {
    searchParams.append("equipment", equipment.id.toString());
  }

  searchParams.append("ad_hoc", "true");

  let url = "list/monitor?" + searchParams.toString();

  const response = await axios.get<ApiResponse<Monitor>>(url);
  const { data } = response;
  return {
    items: data._embedded.items,
    amountOfPages: data.page_count,
    currentPage: data.page,
    totalItems: data.total_items,
    hasMore: data.page < data.page_count,
  };
}
