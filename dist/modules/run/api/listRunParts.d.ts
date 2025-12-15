import { RunPart } from '../interfaces/run/runPart';
import { ApiFormattedResponse } from '../../core/interfaces/response';
import { Run } from '../interfaces/run';
export default function ListRunParts({ run }: {
    run: Run;
}): Promise<ApiFormattedResponse<RunPart>>;
