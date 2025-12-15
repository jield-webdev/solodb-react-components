import { Location } from '../interfaces/location';
export default function GetLocation({ id }: {
    id: number;
}): Promise<Location>;
