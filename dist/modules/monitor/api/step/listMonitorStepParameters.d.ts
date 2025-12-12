import { MonitorStep } from '../../interfaces/monitorStep';
import { ApiFormattedResponse } from '../../../core/interfaces/response';
import { MonitorStepParameter } from '../../interfaces/monitor/step/parameter';
import { MonitorRequirement } from '../../interfaces/monitorRequirement';
export default function ListMonitorStepParameters({ step, requirement, pageSize, order, direction, }: {
    step?: MonitorStep;
    requirement?: MonitorRequirement;
    pageSize?: number;
    order?: "sequence";
    direction?: "asc" | "desc";
}): Promise<ApiFormattedResponse<MonitorStepParameter>>;
