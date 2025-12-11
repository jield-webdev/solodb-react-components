import axios from "axios";
import { createSearchParams } from "react-router-dom";
import { Template } from "@/modules/template/interfaces/template";
import { TemplateStep } from "@/modules/template/interfaces/templateStep";
import { ApiResponse } from "@/modules/core/interfaces/response";

export default async function getTemplateSteps({ template, pageSize }: { template?: Template; pageSize?: number }) {
  let searchParams = createSearchParams();

  if (template !== undefined) {
    searchParams.append("template", template.id.toString());
  }
  if (pageSize !== undefined) {
    searchParams.append("page_size", pageSize.toString());
  }

  let url = "list/template/step?" + searchParams.toString();

  const response = await axios.get<ApiResponse<TemplateStep>>(url);
  const { data } = response;
  return {
    steps: data._embedded.items,
    amountOfPages: data.page_count,
    currentPage: data.page,
    totalItems: data.total_items,
  };
}
