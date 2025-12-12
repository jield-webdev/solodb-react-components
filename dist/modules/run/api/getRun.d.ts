import { Run } from '../interfaces/run';
export default function GetRun({ id }: {
    id: number;
}): Promise<Run>;
