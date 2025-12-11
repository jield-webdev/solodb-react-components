import axios from "axios";
import { createSearchParams } from "react-router-dom";
import { ApiResponse } from "@/modules/core/interfaces/response";
import { ServiceEventReportResult } from "@/modules/service/interfaces/service/event/report/serviceEventReportResult";

export default async function listServiceEventReportResult({ id }: { id: Number }) {
  let searchParams = createSearchParams();

  searchParams.append("report", id.toString());

  let url = "list/service/event/report/results?" + searchParams.toString();

  const response = await axios.get<ApiResponse<ServiceEventReportResult>>(url);
  const { data } = response;

  return data._embedded.items;
}
