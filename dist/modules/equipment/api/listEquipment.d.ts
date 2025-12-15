import { Run } from '../../run/interfaces/run';
import { Equipment } from '../interfaces/equipment';
import { ApiFormattedResponse } from '../../core/interfaces/response';
import { StatusMail } from '../interfaces/statusMail';
import { Room } from '../../room/interfaces/room';
import { FilterData } from '../../core/interfaces/filter';
export default function ListEquipment({ environment, run, room, statusMail, page, pageSize, query, filter, order, direction }: {
    environment?: string;
    run?: Run;
    room?: Room;
    statusMail?: StatusMail;
    page?: number;
    pageSize?: number;
    query?: string;
    filter?: FilterData;
    order?: string;
    direction?: "desc" | "asc";
}): Promise<ApiFormattedResponse<Equipment>>;
