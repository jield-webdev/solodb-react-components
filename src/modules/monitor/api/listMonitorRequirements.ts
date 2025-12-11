import axios from "axios";
import { createSearchParams } from "react-router-dom";
import { MonitorRequirement } from "@/modules/monitor/interfaces/monitorRequirement";
import { ApiFormattedResponse, ApiResponse } from "@/modules/core/interfaces/response";

export default async function ListMonitorRequirements({
  equipmentId,
  monitorId,
}: {
  equipmentId?: number;
  monitorId?: number;
}): Promise<ApiFormattedResponse<MonitorRequirement>> {
  let searchParams = createSearchParams();

  if (equipmentId !== undefined) {
    searchParams.append("equipment", equipmentId.toString());
  }

  if (monitorId) {
    searchParams.append("monitor", monitorId.toString());
  }

  let url = "list/monitor/requirement?" + searchParams.toString();

  const response = await axios.get<ApiResponse<MonitorRequirement>>(url);
  const { data } = response;
  return {
    items: data._embedded.items,
    amountOfPages: data.page_count,
    currentPage: data.page,
    totalItems: data.total_items,
    hasMore: data.page < data.page_count,
  };
}
