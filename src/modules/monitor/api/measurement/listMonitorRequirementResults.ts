import axios from "axios";
import { createSearchParams } from "react-router-dom";
import { MonitorMeasurementResult } from "@/modules/monitor/interfaces/measurement/monitorMeasurementResult";
import { MonitorRequirement } from "@/modules/monitor/interfaces/monitorRequirement";
import { Monitor } from "@/modules/monitor/interfaces/monitor";
import { ApiFormattedResponse, ApiResponse } from "@/modules/core/interfaces/response";

export default async function ListMonitorRequirementResults({
  requirement,
  order,
  direction,
  pageSize,
  page,
}: {
  requirement?: MonitorRequirement;
  monitor?: Monitor;
  order?: "id" | "date-created";
  direction?: "asc" | "desc";
  pageSize?: number;
  page?: number;
}): Promise<ApiFormattedResponse<MonitorMeasurementResult>> {
  let searchParams = createSearchParams();

  if (requirement) {
    searchParams.append("requirement", requirement.id.toString());
  }

  if (order) {
    searchParams.append("order", order);
  }

  if (direction) {
    searchParams.append("direction", direction);
  }

  if (pageSize) {
    searchParams.append("page_size", pageSize.toString());
  }

  if (page) {
    searchParams.append("page", page.toString());
  }

  let url = "list/monitor/measurement/result?" + searchParams.toString();

  const response = await axios.get<ApiResponse<MonitorMeasurementResult>>(url);
  const { data } = response;
  return {
    items: data._embedded.items,
    amountOfPages: data.page_count,
    currentPage: data.page,
    totalItems: data.total_items,
    hasMore: data.page < data.page_count,
  };
}
