import axios from "axios";
import { createSearchParams } from "react-router-dom";
import { ApiFormattedResponse, ApiResponse } from "@/modules/core/interfaces/response";
import { ChemicalContainerPurpose } from "@/modules/chemical/interfaces/chemical/container/chemicalContainerPurpose";

export default async function ListChemicalContainerPurposes({
  query,
}: {
  query?: string;
}): Promise<ApiFormattedResponse<ChemicalContainerPurpose>> {
  let searchParams = createSearchParams();

  if (query) {
    searchParams.append("query", query);
  }

  let url = "list/chemical/container/purpose?" + searchParams.toString();

  const response = await axios.get<ApiResponse<ChemicalContainerPurpose>>(url);
  const { data } = response;
  return {
    items: data._embedded.items,
    amountOfPages: data.page_count,
    currentPage: data.page,
    totalItems: data.total_items,
    hasMore: data.page < data.page_count,
  };
}
