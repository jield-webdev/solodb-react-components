import axios from "axios";
import { ChemicalContainer } from "@/modules/chemical/interfaces/chemical/chemicalContainer";

export default async function GetChemicalContainer({ id }: { id: number }) {
  const response = await axios.get<ChemicalContainer>("view/chemical/container/" + id);
  const { data } = response;
  return data;
}
