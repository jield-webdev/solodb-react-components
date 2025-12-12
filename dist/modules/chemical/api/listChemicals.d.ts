import { ApiFormattedResponse } from '../../core/interfaces/response';
import { Chemical } from '../interfaces/chemical';
export default function ListChemicals({ query }: {
    query?: string;
}): Promise<ApiFormattedResponse<Chemical>>;
