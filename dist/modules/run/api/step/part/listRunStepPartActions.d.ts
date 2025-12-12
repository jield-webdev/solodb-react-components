import { RunStep } from '../../../interfaces/runStep';
import { ApiFormattedResponse } from '../../../../core/interfaces/response';
import { RunStepPartAction } from '../../../interfaces/step/part/runStepPartAction';
import { RunStepPart } from '../../../interfaces/step/runStepPart';
export default function ListRunStepPartActions({ part, step, page_size, }: {
    part?: RunStepPart;
    step?: RunStep;
    page_size?: number;
}): Promise<ApiFormattedResponse<RunStepPartAction>>;
