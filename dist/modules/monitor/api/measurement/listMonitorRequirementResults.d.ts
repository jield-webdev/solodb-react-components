import { MonitorMeasurementResult } from '../../interfaces/measurement/monitorMeasurementResult';
import { MonitorRequirement } from '../../interfaces/monitorRequirement';
import { Monitor } from '../../interfaces/monitor';
import { ApiFormattedResponse } from '../../../core/interfaces/response';
export default function ListMonitorRequirementResults({ requirement, order, direction, pageSize, page, }: {
    requirement?: MonitorRequirement;
    monitor?: Monitor;
    order?: "id" | "date-created";
    direction?: "asc" | "desc";
    pageSize?: number;
    page?: number;
}): Promise<ApiFormattedResponse<MonitorMeasurementResult>>;
