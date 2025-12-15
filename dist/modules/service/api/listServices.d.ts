import { ApiFormattedResponse } from '../../core/interfaces/response';
import { Service } from '../interfaces/service';
export default function ListServices({ equipmentId, }: {
    equipmentId?: number;
}): Promise<ApiFormattedResponse<Service>>;
