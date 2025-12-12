import { ApiFormattedResponse } from '../../core/interfaces/response';
import { Location } from '../interfaces/location';
import { Room } from '../interfaces/room';
export default function ListLocations({ environment, room, pageSize, }: {
    environment?: string;
    room?: Room;
    pageSize?: number;
}): Promise<ApiFormattedResponse<Location>>;
