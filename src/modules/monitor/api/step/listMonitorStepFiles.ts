import axios from "axios";
import { createSearchParams } from "react-router-dom";
import { MonitorStep } from "@/modules/monitor/interfaces/monitorStep";
import { File } from "@/modules/core/interfaces/file";
import { ApiFormattedResponse, ApiResponse } from "@/modules/core/interfaces/response";

export default async function ListMonitorStepFiles({
  step,
  pageSize,
  order,
  direction,
}: {
  step?: MonitorStep;
  pageSize?: number;
  order?: "id" | "date-created";
  direction?: "asc" | "desc";
}): Promise<ApiFormattedResponse<File>> {
  let searchParams = createSearchParams();

  if (step !== undefined) {
    searchParams.append("step", step.id.toString());
  }
  if (pageSize !== undefined) {
    searchParams.append("page_size", pageSize.toString());
  }

  if (order) {
    searchParams.append("order", order);
  }

  if (direction) {
    searchParams.append("direction", direction);
  }

  let url = "list/monitor/step/file?" + searchParams.toString();
  const response = await axios.get<ApiResponse<File>>(url);

  const { data } = response;
  return {
    items: data._embedded.items,
    amountOfPages: data.page_count,
    currentPage: data.page,
    totalItems: data.total_items,
    hasMore: data.page < data.page_count,
  };
}
