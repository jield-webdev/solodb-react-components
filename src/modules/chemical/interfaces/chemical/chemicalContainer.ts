import { Chemical } from "@/modules/chemical/interfaces/chemical";
import { Project } from "@/modules/core/interfaces/project";
import { ChemicalContainerType } from "@/modules/chemical/interfaces/chemical/container/chemicalContainerType";
import { ChemicalContainerPurpose } from "@/modules/chemical/interfaces/chemical/container/chemicalContainerPurpose";
import { ChemicalContainerMethodOfUse } from "@/modules/chemical/interfaces/chemical/container/chemicalContainerMethodOfUse";
import { Location } from "@/modules/room/interfaces/location";

export interface ChemicalContainer {
  id: number;
  chemical: Chemical;
  location: Location;
  project: Project;
  is_marked_for_removal: boolean;
  is_marked_for_removal_date?: string;
  is_deleted: boolean;
  supplier: string | null;
  concentration: string | null;
  amount: number | null;
  amount_unit: string | null;
  order_number: string | null;
  type: ChemicalContainerType;
  purpose: ChemicalContainerPurpose;
  method_of_use: ChemicalContainerMethodOfUse;
  amount_of_users: number;
  amount_of_active_users: number;
  amount_of_inactive_users: number;
  date_arrived: string | null;
  date_expired: string | null;
  date_opened: string | null;
  i_am_user?: boolean;
  i_am_responsible?: boolean;
}
