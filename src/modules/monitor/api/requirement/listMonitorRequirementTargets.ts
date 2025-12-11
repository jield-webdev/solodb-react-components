import axios from "axios";
import { createSearchParams } from "react-router-dom";
import { MonitorRequirement } from "@/modules/monitor/interfaces/monitorRequirement";
import { MonitorRequirementTarget } from "@/modules/monitor/interfaces/requirement/monitorRequirementTarget";
import { ApiFormattedResponse, ApiResponse } from "@/modules/core/interfaces/response";

export default async function ListMonitorRequirementTargets({
  requirement,
}: {
  requirement?: MonitorRequirement;
}): Promise<ApiFormattedResponse<MonitorRequirementTarget>> {
  let searchParams = createSearchParams();

  if (requirement) {
    searchParams.append("requirement", requirement.id.toString());
  }

  let url = "list/monitor/requirement/target?" + searchParams.toString();

  const response = await axios.get<ApiResponse<MonitorRequirementTarget>>(url);
  const { data } = response;
  return {
    items: data._embedded.items,
    amountOfPages: data.page_count,
    currentPage: data.page,
    totalItems: data.total_items,
    hasMore: data.page < data.page_count,
  };
}
