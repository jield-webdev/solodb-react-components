import axios from "axios";
import { createSearchParams } from "react-router-dom";
import { ApiFormattedResponse, ApiResponse } from "@/modules/core/interfaces/response";
import { Service } from "@/modules/service/interfaces/service";

export default async function ListServices({
  equipmentId,
}: {
  equipmentId?: number;
}): Promise<ApiFormattedResponse<Service>> {
  let searchParams = createSearchParams();

  if (equipmentId !== undefined) {
    searchParams.append("equipment", equipmentId.toString());
  }

  let url = "list/service?" + searchParams.toString();

  const response = await axios.get<ApiResponse<Service>>(url);
  const { data } = response;

  return {
    items: data._embedded.items,
    amountOfPages: data.page_count,
    currentPage: data.page,
    totalItems: data.total_items,
    hasMore: data.page < data.page_count,
  };
}
