import axios from "axios";
import { createSearchParams } from "react-router-dom";
import { RunPart } from "@/modules/run/interfaces/run/runPart";
import { ApiFormattedResponse, ApiResponse } from "@/modules/core/interfaces/response";
import { Run } from "@/modules/run/interfaces/run";

export default async function ListRunParts({ run }: { run: Run }): Promise<ApiFormattedResponse<RunPart>> {
  let searchParams = createSearchParams();
  searchParams.append("run", run.id.toString());
  searchParams.append("page_size", "10000");

  let url = "list/run/parts?" + searchParams.toString();

  const response = await axios.get<ApiResponse<RunPart>>(url);
  const { data } = response;
  return {
    items: data._embedded.items,
    amountOfPages: data.page_count,
    currentPage: data.page,
    totalItems: data.total_items,
    hasMore: data.page < data.page_count,
  };
}
