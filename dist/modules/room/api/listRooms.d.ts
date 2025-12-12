import { ApiFormattedResponse } from '../../core/interfaces/response';
import { Room } from '../interfaces/room';
export default function ListRooms({ environment, withLocations, }: {
    environment?: string;
    withLocations?: boolean;
}): Promise<ApiFormattedResponse<Room>>;
