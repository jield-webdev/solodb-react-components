import { RunStepPart } from '../../interfaces/step/runStepPart';
import { RunStep } from '../../interfaces/runStep';
import { ApiFormattedResponse } from '../../../core/interfaces/response';
import { Run } from '../../interfaces/run';
export default function ListRunStepParts({ step, run, page_size, }: {
    step?: RunStep;
    run?: Run;
    page_size?: number;
}): Promise<ApiFormattedResponse<RunStepPart>>;
