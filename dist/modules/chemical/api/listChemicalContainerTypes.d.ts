import { ApiFormattedResponse } from '../../core/interfaces/response';
import { ChemicalContainerType } from '../interfaces/chemical/container/chemicalContainerType';
export default function ListChemicalContainerTypes({ query, }: {
    query?: string;
}): Promise<ApiFormattedResponse<ChemicalContainerType>>;
