import axios from "axios";
import { createSearchParams } from "react-router-dom";
import { ApiFormattedResponse, ApiResponse } from "@/modules/core/interfaces/response";
import { Measurement } from "@/modules/run/interfaces/measurement";
import { MeasurementResult } from "@/modules/run/interfaces/measurement/result";

export default async function ListMeasurementResults({
  measurement,
}: {
  measurement: Measurement;
}): Promise<ApiFormattedResponse<MeasurementResult>> {
  let searchParams = createSearchParams();

  searchParams.append("measurement", String(measurement.id));

  let url = "/list/run/measurement/result?" + searchParams.toString();

  const response = await axios.get<ApiResponse<MeasurementResult>>(url);
  const { data } = response;
  return {
    items: data._embedded.items,
    amountOfPages: data.page_count,
    currentPage: data.page,
    totalItems: data.total_items,
    hasMore: data.page < data.page_count,
  };
}
