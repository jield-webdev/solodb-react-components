import { ChemicalContainer } from '../interfaces/chemical/chemicalContainer';
export default function GetChemicalContainer({ id }: {
    id: number;
}): Promise<ChemicalContainer>;
