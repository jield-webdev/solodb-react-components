import axios from "axios";
import { createSearchParams } from "react-router-dom";
import { ApiFormattedResponse, ApiResponse } from "@/modules/core/interfaces/response";
import { Chemical } from "@/modules/chemical/interfaces/chemical";

export default async function ListChemicals({ query }: { query?: string }): Promise<ApiFormattedResponse<Chemical>> {
  let searchParams = createSearchParams();

  if (query) {
    searchParams.append("query", query);
  }

  let url = "list/chemical?" + searchParams.toString();

  const response = await axios.get<ApiResponse<Chemical>>(url);
  const { data } = response;
  return {
    items: data._embedded.items,
    amountOfPages: data.page_count,
    currentPage: data.page,
    totalItems: data.total_items,
    hasMore: data.page < data.page_count,
  };
}
