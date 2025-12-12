import { Room } from '../interfaces/room';
export default function GetRoom({ id }: {
    id: number;
}): Promise<Room>;
