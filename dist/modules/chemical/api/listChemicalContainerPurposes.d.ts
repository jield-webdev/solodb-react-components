import { ApiFormattedResponse } from '../../core/interfaces/response';
import { ChemicalContainerPurpose } from '../interfaces/chemical/container/chemicalContainerPurpose';
export default function ListChemicalContainerPurposes({ query, }: {
    query?: string;
}): Promise<ApiFormattedResponse<ChemicalContainerPurpose>>;
