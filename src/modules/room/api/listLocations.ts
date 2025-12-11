import axios from "axios";
import { createSearchParams } from "react-router-dom";
import { ApiFormattedResponse, ApiResponse } from "@/modules/core/interfaces/response";
import { Location } from "@/modules/room/interfaces/location";
import { Room } from "@/modules/room/interfaces/room";

export default async function ListLocations({
  environment,
  room,
  pageSize = 25,
}: {
  environment?: string;
  room?: Room;
  pageSize?: number;
}): Promise<ApiFormattedResponse<Location>> {
  let searchParams = createSearchParams();

  if (environment) {
    searchParams.append("environment", environment);
  }

  if (room) {
    searchParams.append("room", room.id.toString());
  }

  searchParams.append("page_size", pageSize.toString());

  let url = "list/location?" + searchParams.toString();

  const response = await axios.get<ApiResponse<Location>>(url);
  const { data } = response;
  return {
    items: data._embedded.items,
    amountOfPages: data.page_count,
    currentPage: data.page,
    totalItems: data.total_items,
    hasMore: data.page < data.page_count,
  };
}
