import { Setup } from '../interfaces/setup';
export default function GetSetup({ id }: {
    id: number;
}): Promise<Setup>;
