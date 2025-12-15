import { RunStep } from '../../interfaces/runStep';
import { File } from '../../../core/interfaces/file';
import { ApiFormattedResponse } from '../../../core/interfaces/response';
export default function ListRunStepFiles({ step, pageSize, }: {
    step?: RunStep;
    pageSize?: number;
}): Promise<ApiFormattedResponse<File>>;
