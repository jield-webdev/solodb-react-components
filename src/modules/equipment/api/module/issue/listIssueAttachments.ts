import axios from "axios";
import { createSearchParams } from "react-router-dom";
import { ApiFormattedResponse, ApiResponse } from "@/modules/core/interfaces/response";
import { Equipment } from "@/modules/equipment/interfaces/equipment";
import { EquipmentModule } from "@/modules/equipment/interfaces/equipment/equipmentModule";
import { StatusMail } from "@/modules/equipment/interfaces/statusMail";
import { EquipmentModuleIssueAttachment } from "@/modules/equipment/interfaces/equipment/module/issue/equipmentModuleIssueAttachment";

export default async function ListIssueAttachments({
  equipment,
  module,
  statusMail,
}: {
  equipment?: Equipment;
  module?: EquipmentModule;
  statusMail?: StatusMail;
}): Promise<ApiFormattedResponse<EquipmentModuleIssueAttachment>> {
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

  let url = "list/equipment/module/issue/attachment?" + searchParams.toString();

  const response = await axios.get<ApiResponse<EquipmentModuleIssueAttachment>>(url);
  const { data } = response;
  return {
    items: data._embedded.items,
    amountOfPages: data.page_count,
    currentPage: data.page,
    totalItems: data.total_items,
    hasMore: data.page < data.page_count,
  };
}
