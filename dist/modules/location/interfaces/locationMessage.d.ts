import { MessageType } from './message/messageType';
import { User } from '../../core/interfaces/user';
import { Room } from '../../room/interfaces/room';
export interface LocationMessage {
    id: number;
    title: string;
    description: string;
    date_created: string;
    last_update: string | null;
    type: MessageType;
    owner: User;
    updated_by: User | null;
    rooms: Room[];
}
