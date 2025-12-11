import axios from "axios";
import { createSearchParams } from "react-router-dom";
import { Run } from "@/modules/run/interfaces/run";
import { Equipment } from "@/modules/equipment/interfaces/equipment";
import { ApiFormattedResponse, ApiResponse } from "@/modules/core/interfaces/response";

export default async function ListRuns({
  environment,
  firstUnfinishedStepEquipment,
}: {
  environment?: string;
  firstUnfinishedStepEquipment?: Equipment;
}): Promise<ApiFormattedResponse<Run>> {
  let searchParams = createSearchParams();

  if (firstUnfinishedStepEquipment !== undefined) {
    searchParams.append("operator", "1");
    searchParams.append("first_unfinished_step_equipment_id", firstUnfinishedStepEquipment.id.toString());
  }

  if (environment !== undefined) {
    searchParams.append("environment", environment);
  }

  let url = "list/run?" + searchParams.toString();

  const response = await axios.get<ApiResponse<Run>>(url);
  const { data } = response;
  return {
    items: data._embedded.items,
    amountOfPages: data.page_count,
    currentPage: data.page,
    totalItems: data.total_items,
    hasMore: data.page < data.page_count,
  };
}
