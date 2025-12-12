import { Run } from '../interfaces/run';
import { Equipment } from '../../equipment/interfaces/equipment';
import { ApiFormattedResponse } from '../../core/interfaces/response';
export default function ListRuns({ environment, firstUnfinishedStepEquipment, }: {
    environment?: string;
    firstUnfinishedStepEquipment?: Equipment;
}): Promise<ApiFormattedResponse<Run>>;
