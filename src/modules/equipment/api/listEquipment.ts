import axios from "axios";
import { createSearchParams } from "react-router-dom";
import { Run } from "@/modules/run/interfaces/run";
import { Equipment } from "@/modules/equipment/interfaces/equipment";
import { ApiFormattedResponse, ApiResponse } from "@/modules/core/interfaces/response";
import { StatusMail } from "@/modules/equipment/interfaces/statusMail";
import { Room } from "@/modules/room/interfaces/room";
import { FilterData } from "@/modules/core/interfaces/filter";

function cleanFilterData(data: FilterData): FilterData {
  let cleanedData = { ...data };
  cleanedData.facet = Object.fromEntries(Object.entries(data.facet).filter(([_, facet]) => facet.values.length > 0));

  if (data.filter.general.length <= 0) {
    // @ts-expect-error
    cleanedData.filter = {};
  }
  return cleanedData;
}

export default async function ListEquipment({
  environment,
  run,
  room,
  statusMail,
  page = 1,
  pageSize = 25,
  query,
  filter,
  order,
  direction
}: {
  environment?: string;
  run?: Run;
  room?: Room;
  statusMail?: StatusMail;
  page?: number;
  pageSize?: number;
  query?: string;
  filter?: FilterData;
  order?: string;
  direction?: "desc" | "asc";
}): Promise<ApiFormattedResponse<Equipment>> {
  let searchParams = createSearchParams();

  if (environment !== undefined) {
    searchParams.append("environment", environment);
  }

  if (run !== undefined) {
    searchParams.append("run", run.id.toString());
  }

  if (room !== undefined) {
    searchParams.append("room", room.id.toString());
  }

  if (query !== undefined) {
    searchParams.append("query", query);
  }

  if (order !== undefined) {
    searchParams.append("order", order);
  }

  if (direction !== undefined) {
    searchParams.append("direction", direction);
  }

  if (statusMail !== undefined) {
    searchParams.append("status_mail", statusMail.id.toString());

    // Use a reasonable page size for infinite scrolling
    searchParams.append("page_size", "200");
  }

  if (filter !== undefined) {
    filter = cleanFilterData(filter);
    searchParams.append("filter", btoa(JSON.stringify(filter)));
  }

  searchParams.append("page", page.toString());
  searchParams.append("page_size", pageSize.toString());

  let url = "list/equipment?" + searchParams.toString();

  const response = await axios.get<ApiResponse<Equipment>>(url);
  const { data } = response;

  return {
    items: data._embedded.items,
    amountOfPages: data.page_count,
    currentPage: data.page,
    totalItems: data.total_items,
    hasMore: data.page < data.page_count,
  };
}
