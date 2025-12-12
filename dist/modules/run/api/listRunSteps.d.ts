import { Run } from '../interfaces/run';
import { RunStep } from '../interfaces/runStep';
import { ApiFormattedResponse } from '../../core/interfaces/response';
export default function ListRunSteps({ run, page, pageSize, }: {
    run: Run;
    page?: number;
    pageSize?: number;
}): Promise<ApiFormattedResponse<RunStep>>;
