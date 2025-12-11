import axios from "axios";
import { createSearchParams } from "react-router-dom";
import { ApiFormattedResponse, ApiResponse } from "@/modules/core/interfaces/response";
import { EquipmentModuleParameter } from "@/modules/equipment/interfaces/equipment/module/equipmentModuleParameter";
import { EquipmentModule } from "@/modules/equipment/interfaces/equipment/equipmentModule";

export default async function ListEquipmentModuleParameters({
  module,
  pageSize,
  order,
  direction,
}: {
  module?: EquipmentModule;
  pageSize?: number;
  order?: "sequence";
  direction?: "asc" | "desc";
}): Promise<ApiFormattedResponse<EquipmentModuleParameter>> {
  let searchParams = createSearchParams();

  if (module !== undefined) {
    searchParams.append("module", module.id.toString());
  }
  if (pageSize !== undefined) {
    searchParams.append("page_size", pageSize.toString());
  }
  if (order) {
    searchParams.append("order", order);
  }
  if (direction) {
    searchParams.append("direction", direction);
  }

  let url = "list/equipment/module/parameter?" + searchParams.toString();

  const response = await axios.get<ApiResponse<EquipmentModuleParameter>>(url);
  const { data } = response;
  return {
    items: data._embedded.items,
    amountOfPages: data.page_count,
    currentPage: data.page,
    totalItems: data.total_items,
    hasMore: data.page < data.page_count,
  };
}
