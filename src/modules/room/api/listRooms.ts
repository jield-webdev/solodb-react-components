import axios from "axios";
import { createSearchParams } from "react-router-dom";
import { ApiFormattedResponse, ApiResponse } from "@/modules/core/interfaces/response";
import { Room } from "@/modules/room/interfaces/room";

export default async function ListRooms({
  environment,
  withLocations,
}: {
  environment?: string;
  withLocations?: boolean;
}): Promise<ApiFormattedResponse<Room>> {
  let searchParams = createSearchParams();

  if (environment) {
    searchParams.append("environment", environment);
  }

  if (withLocations) {
    searchParams.append("which", "with_locations");
  }

  let url = "list/room?" + searchParams.toString();

  const response = await axios.get<ApiResponse<Room>>(url);
  const { data } = response;
  return {
    items: data._embedded.items,
    amountOfPages: data.page_count,
    currentPage: data.page,
    totalItems: data.total_items,
    hasMore: data.page < data.page_count,
  };
}
