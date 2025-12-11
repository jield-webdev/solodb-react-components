import axios from "axios";
import { createSearchParams } from "react-router-dom";
import { Recipe } from "@/modules/process/interfaces/module/recipe";
import { Template } from "@/modules/template/interfaces/template";
import { ApiResponse } from "@/modules/core/interfaces/response";

export default async function ListTemplates({ reworkRecipes }: { reworkRecipes?: Recipe[] }) {
  let searchParams = createSearchParams();

  if (reworkRecipes !== undefined) {
    //Add the rework recipe ids to the search params, in array notation
    reworkRecipes
      .map((recipe) => recipe.id)
      .forEach((id) => {
        searchParams.append("rework_recipe_id[]", id.toString());
      });
  }

  let url = "list/template?" + searchParams.toString();

  const response = await axios.get<ApiResponse<Template>>(url);
  const { data } = response;
  return {
    templates: data._embedded.items,
    amountOfPages: data.page_count,
    currentPage: data.page,
    totalItems: data.total_items,
  };
}
