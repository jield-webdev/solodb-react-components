import axios from "axios";
import { createSearchParams } from "react-router-dom";
import { ApiFormattedResponse, ApiResponse } from "@/modules/core/interfaces/response";
import { ChemicalContainerMethodOfUse } from "@/modules/chemical/interfaces/chemical/container/chemicalContainerMethodOfUse";

export default async function ListChemicalContainerMethodsOfUse({
  query,
}: {
  query?: string;
}): Promise<ApiFormattedResponse<ChemicalContainerMethodOfUse>> {
  let searchParams = createSearchParams();

  if (query) {
    searchParams.append("query", query);
  }
  let url = "list/chemical/container/method-of-use?" + searchParams.toString();

  const response = await axios.get<ApiResponse<ChemicalContainerMethodOfUse>>(url);
  const { data } = response;
  return {
    items: data._embedded.items,
    amountOfPages: data.page_count,
    currentPage: data.page,
    totalItems: data.total_items,
    hasMore: data.page < data.page_count,
  };
}
