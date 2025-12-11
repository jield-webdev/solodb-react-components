import axios from "axios";
import { createSearchParams } from "react-router-dom";
import { RunStepPart } from "@/modules/run/interfaces/step/runStepPart";
import { RunStep } from "@/modules/run/interfaces/runStep";
import { ApiFormattedResponse, ApiResponse } from "@/modules/core/interfaces/response";
import { Run } from "@/modules/run/interfaces/run";

export default async function ListRunStepParts({
  step,
  run,
  page_size,
}: {
  step?: RunStep;
  run?: Run;
  page_size?: number;
}): Promise<ApiFormattedResponse<RunStepPart>> {
  let searchParams = createSearchParams();

  if (step !== undefined) {
    searchParams.append("step", step.id.toString());
  }
  if (run !== undefined) {
    searchParams.append("run", run.id.toString());
  }
  if (page_size !== undefined) {
    searchParams.append("page_size", page_size.toString());
  } else {
    searchParams.append("page_size", "10000");
  }

  let url = "list/run/step/part?" + searchParams.toString();

  const response = await axios.get<ApiResponse<RunStepPart>>(url);
  const { data } = response;

  return {
    items: data._embedded.items,
    amountOfPages: data.page_count,
    currentPage: data.page,
    totalItems: data.total_items,
    hasMore: data.page < data.page_count,
  };
}
