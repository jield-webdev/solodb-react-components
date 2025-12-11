import axios from "axios";
import { FilterData, FilterFormData } from "../interfaces/filter";
import { createSearchParams } from "react-router-dom";
import { ApiResponse } from "../interfaces/response";

function cleanFilterData(data: FilterData): FilterData {
  let cleanedData = { ...data };
  cleanedData.facet = Object.fromEntries(Object.entries(data.facet).filter(([_, facet]) => facet.values.length > 0));

  if (data.filter.general.length <= 0) {
    // @ts-expect-error
    cleanedData.filter = {};
  }
  return cleanedData;
}

export default async function GetFilter({
  service,
  environment,
  formResult,
}: {
  service: string;
  environment?: string;
  formResult?: FilterData;
}): Promise<FilterFormData> {
  let searchParams = createSearchParams();

  if (service !== undefined) {
    searchParams.append("service", service);
  }

  if (environment !== undefined) {
    searchParams.append("environment", environment);
  }

  if (formResult !== undefined) {
    let formData = JSON.stringify(cleanFilterData(formResult));
    searchParams.append("formResult", btoa(formData));
  }

  let url = "view/filter?" + searchParams.toString();

  const response = await axios.get<ApiResponse<any>>(url);
  const { data } = response;

  return {
    filter: data._embedded.items[0],
    facet: data._embedded.items[1],
  };
}
