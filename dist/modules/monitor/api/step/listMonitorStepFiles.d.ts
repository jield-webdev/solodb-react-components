import { MonitorStep } from '../../interfaces/monitorStep';
import { File } from '../../../core/interfaces/file';
import { ApiFormattedResponse } from '../../../core/interfaces/response';
export default function ListMonitorStepFiles({ step, pageSize, order, direction, }: {
    step?: MonitorStep;
    pageSize?: number;
    order?: "id" | "date-created";
    direction?: "asc" | "desc";
}): Promise<ApiFormattedResponse<File>>;
