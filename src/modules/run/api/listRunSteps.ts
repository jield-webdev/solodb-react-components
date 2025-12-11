import axios from "axios";
import { createSearchParams } from "react-router-dom";
import { Run } from "@/modules/run/interfaces/run";
import { RunStep } from "@/modules/run/interfaces/runStep";
import { ApiFormattedResponse, ApiResponse } from "@/modules/core/interfaces/response";

export default async function ListRunSteps({
  run,
  page = 1,
  pageSize = 25,
}: {
  run: Run;
  page?: number;
  pageSize?: number;
}): Promise<ApiFormattedResponse<RunStep>> {
  let searchParams = createSearchParams();

  if (run !== undefined) {
    searchParams.append("run", run.id.toString());
  }
  searchParams.append("page", page.toString());
  searchParams.append("page_size", pageSize.toString());
  let url = "list/run/step?" + searchParams.toString();

  const response = await axios.get<ApiResponse<RunStep>>(url);
  const { data } = response;

  return {
    items: data._embedded.items,
    amountOfPages: data.page_count,
    currentPage: data.page,
    totalItems: data.total_items,
    hasMore: data.page < data.page_count,
  };
}
