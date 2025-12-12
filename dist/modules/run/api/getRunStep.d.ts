import { RunStep } from '../interfaces/runStep';
export default function GetRunStep({ id }: {
    id: number;
}): Promise<RunStep>;
