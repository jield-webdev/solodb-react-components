import axios from "axios";
import { createSearchParams } from "react-router-dom";
import { RunStep } from "@/modules/run/interfaces/runStep";
import { ApiFormattedResponse, ApiResponse } from "@/modules/core/interfaces/response";
import { RunStepParameter } from "@/modules/run/interfaces/step/runStepParameter";

export default async function ListRunStepParameters({
  runStep,
}: {
  runStep: RunStep;
}): Promise<ApiFormattedResponse<RunStepParameter>> {
  let searchParams = createSearchParams();

  if (runStep !== undefined) {
    searchParams.append("step", runStep.id.toString());
  }
  let url = "list/run/step/parameter?" + searchParams.toString();

  const response = await axios.get<ApiResponse<RunStepParameter>>(url);
  const { data } = response;
  return {
    items: data._embedded.items,
    amountOfPages: data.page_count,
    currentPage: data.page,
    totalItems: data.total_items,
    hasMore: data.page < data.page_count,
  };
}
