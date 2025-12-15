import { Monitor } from '../interfaces/monitor';
export default function getMonitor({ id }: {
    id: number;
}): Promise<Monitor>;
