import axios from "axios";
import { createSearchParams } from "react-router-dom";
import { ApiFormattedResponse, ApiResponse } from "@/modules/core/interfaces/response";
import { ChemicalContainerType } from "@/modules/chemical/interfaces/chemical/container/chemicalContainerType";

export default async function ListChemicalContainerTypes({
  query,
}: {
  query?: string;
}): Promise<ApiFormattedResponse<ChemicalContainerType>> {
  let searchParams = createSearchParams();

  if (query) {
    searchParams.append("query", query);
  }

  let url = "list/chemical/container/type?" + searchParams.toString();

  const response = await axios.get<ApiResponse<ChemicalContainerType>>(url);
  const { data } = response;
  return {
    items: data._embedded.items,
    amountOfPages: data.page_count,
    currentPage: data.page,
    totalItems: data.total_items,
    hasMore: data.page < data.page_count,
  };
}
