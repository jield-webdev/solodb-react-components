import { MainChemical } from "@/modules/chemical/interfaces/mainChemical";
import { SafetyStatement } from "@/modules/chemical/interfaces/safetyStatement";
import { SafetyIcon } from "@/modules/chemical/interfaces/safetyIcon";

export enum ChemicalStandardProductEnum {
  STANDARD_PRODUCT = 1,
  NON_STANDARD_PRODUCT = 2,
}

export enum ChemicalPhysicalStateEnum {
  SOLID = 1,
  LIQUID = 2,
  GAS = 3,
  OTHER = 4,
}

export interface Chemical {
  id: number;
  name: string;
  cas_number: string | null;
  chemical_formula: string | null;
  ehs_link: string | null;
  cmr: string[];
  description: string | null;
  is_standard_product: boolean;
  standard_product: ChemicalStandardProductEnum;
  physical_state: ChemicalPhysicalStateEnum;
  is_halogenated: boolean;
  contains_metals: boolean;
  main_chemical: MainChemical | null;
  safety_statement: SafetyStatement[];
  safety_icons: SafetyIcon[];
}
