import axios from "axios";
import { createSearchParams } from "react-router-dom";
import { ApiFormattedResponse, ApiResponse } from "@/modules/core/interfaces/response";
import { Equipment } from "@/modules/equipment/interfaces/equipment";
import { EquipmentModule } from "@/modules/equipment/interfaces/equipment/equipmentModule";
import { StatusMail } from "@/modules/equipment/interfaces/statusMail";
import { EquipmentModuleEcnAttachment } from "@/modules/equipment/interfaces/equipment/module/ecn/equipmentModuleEcnAttachment";

export default async function ListEcnAttachments({
  equipment,
  module,
  statusMail,
}: {
  equipment?: Equipment;
  module?: EquipmentModule;
  statusMail?: StatusMail;
}): Promise<ApiFormattedResponse<EquipmentModuleEcnAttachment>> {
  let searchParams = createSearchParams();

  if (equipment !== undefined) {
    searchParams.append("equipment", equipment.id.toString());
  }
  if (module !== undefined) {
    searchParams.append("module", module.id.toString());
  }

  if (statusMail !== undefined) {
    searchParams.append("status_mail", statusMail.id.toString());
    searchParams.append("page_size", "1000");
  }

  let url = "list/equipment/module/ecn/attachment?" + searchParams.toString();

  const response = await axios.get<ApiResponse<EquipmentModuleEcnAttachment>>(url);
  const { data } = response;

  return {
    items: data._embedded.items,
    amountOfPages: data.page_count,
    currentPage: data.page,
    totalItems: data.total_items,
    hasMore: data.page < data.page_count,
  };
}
