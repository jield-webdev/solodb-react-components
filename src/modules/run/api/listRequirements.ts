import axios from "axios";
import { createSearchParams } from "react-router-dom";
import { Run } from "@/modules/run/interfaces/run";
import { ApiFormattedResponse, ApiResponse } from "@/modules/core/interfaces/response";
import { RunStep } from "@/modules/run/interfaces/runStep";
import { Requirement } from "@/modules/run/interfaces/requirement";

export default async function ListRequirements({
  step,
  run,
}: {
  step?: RunStep;
  run?: Run;
}): Promise<ApiFormattedResponse<Requirement>> {
  let searchParams = createSearchParams();

  if (step !== undefined) {
    searchParams.append("step", String(step.id));
  }

  if (run !== undefined) {
    searchParams.append("run", String(run.id));
  }

  let url = "list/run/requirement?" + searchParams.toString();

  const response = await axios.get<ApiResponse<Requirement>>(url);
  const { data } = response;
  return {
    items: data._embedded.items,
    amountOfPages: data.page_count,
    currentPage: data.page,
    totalItems: data.total_items,
    hasMore: data.page < data.page_count,
  };
}
