import { RunStep } from '../../interfaces/runStep';
import { ApiFormattedResponse } from '../../../core/interfaces/response';
import { RunStepParameter } from '../../interfaces/step/runStepParameter';
export default function ListRunStepParameters({ runStep, }: {
    runStep: RunStep;
}): Promise<ApiFormattedResponse<RunStepParameter>>;
