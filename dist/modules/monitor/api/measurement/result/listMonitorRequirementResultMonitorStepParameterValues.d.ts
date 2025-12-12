import { MonitorMeasurementResult } from '../../../interfaces/measurement/monitorMeasurementResult';
import { MonitorRequirement } from '../../../interfaces/monitorRequirement';
import { ApiFormattedResponse } from '../../../../core/interfaces/response';
import { MonitorResultStepParameterValue } from '../../../interfaces/measurement/result/monitorResultStepParameterValue';
export default function ListMonitorRequirementResultMonitorStepParameterValues({ requirement, result, order, direction, pageSize, page, }: {
    requirement?: MonitorRequirement;
    result?: MonitorMeasurementResult;
    order?: "id" | "date-created";
    direction?: "asc" | "desc";
    pageSize?: number;
    page?: number;
}): Promise<ApiFormattedResponse<MonitorResultStepParameterValue>>;
