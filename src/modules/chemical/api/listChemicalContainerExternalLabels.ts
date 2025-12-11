import axios from "axios";
import { createSearchParams } from "react-router-dom";
import { ApiFormattedResponse, ApiResponse } from "@/modules/core/interfaces/response";
import { ChemicalContainerExternalLabel } from "@/modules/chemical/interfaces/chemical/container/chemicalContainerExternalLabel";

export default async function ListChemicalContainerExternalLabels({
  qrCodeContent,
}: {
  qrCodeContent: string;
}): Promise<ApiFormattedResponse<ChemicalContainerExternalLabel>> {
  let searchParams = createSearchParams();

  searchParams.append("qr_code_content", qrCodeContent);

  let url = "list/chemical/container/external-label?" + searchParams.toString();

  const response = await axios.get<ApiResponse<ChemicalContainerExternalLabel>>(url);
  const { data } = response;
  return {
    items: data._embedded.items,
    amountOfPages: data.page_count,
    currentPage: data.page,
    totalItems: data.total_items,
    hasMore: data.page < data.page_count,
  };
}
