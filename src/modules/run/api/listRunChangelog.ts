import axios from "axios";
import { createSearchParams } from "react-router-dom";
import { Run } from "@/modules/run/interfaces/run";
import { Changelog } from "@/modules/run/interfaces/run/changelog";
import { ApiFormattedResponse, ApiResponse } from "@/modules/core/interfaces/response";

export default async function ListRunChangelog({
  run,
  page,
}: {
  run: Run;
  page: number;
}): Promise<ApiFormattedResponse<Changelog>> {
  let searchParams = createSearchParams();

  if (run !== undefined) {
    searchParams.append("run", run.id.toString());
  }
  searchParams.append("page", page.toString());

  let url = "list/run/changelog?" + searchParams.toString();

  const response = await axios.get<ApiResponse<Changelog>>(url);
  const { data } = response;
  return {
    items: data._embedded.items,
    amountOfPages: data.page_count,
    currentPage: data.page,
    totalItems: data.total_items,
    hasMore: data.page < data.page_count,
  };
}
