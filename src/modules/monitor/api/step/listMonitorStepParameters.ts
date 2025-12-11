import axios from "axios";
import { createSearchParams } from "react-router-dom";
import { MonitorStep } from "@/modules/monitor/interfaces/monitorStep";
import { File } from "@/modules/core/interfaces/file";
import { ApiFormattedResponse, ApiResponse } from "@/modules/core/interfaces/response";
import { MonitorStepParameter } from "@/modules/monitor/interfaces/monitor/step/parameter";
import { MonitorRequirement } from "@/modules/monitor/interfaces/monitorRequirement";

export default async function ListMonitorStepParameters({
  step,
  requirement,
  pageSize,
  order,
  direction,
}: {
  step?: MonitorStep;
  requirement?: MonitorRequirement;
  pageSize?: number;
  order?: "sequence";
  direction?: "asc" | "desc";
}): Promise<ApiFormattedResponse<MonitorStepParameter>> {
  let searchParams = createSearchParams();

  if (step !== undefined) {
    searchParams.append("step", step.id.toString());
  }
  if (requirement !== undefined) {
    searchParams.append("requirement", requirement.id.toString());
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

  let url = "list/monitor/step/parameter?" + searchParams.toString();

  const response = await axios.get<ApiResponse<MonitorStepParameter>>(url);
  const { data } = response;
  return {
    items: data._embedded.items,
    amountOfPages: data.page_count,
    currentPage: data.page,
    totalItems: data.total_items,
    hasMore: data.page < data.page_count,
  };
}
