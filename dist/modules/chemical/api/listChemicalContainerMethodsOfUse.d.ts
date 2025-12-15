import { ApiFormattedResponse } from '../../core/interfaces/response';
import { ChemicalContainerMethodOfUse } from '../interfaces/chemical/container/chemicalContainerMethodOfUse';
export default function ListChemicalContainerMethodsOfUse({ query, }: {
    query?: string;
}): Promise<ApiFormattedResponse<ChemicalContainerMethodOfUse>>;
