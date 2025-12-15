import { RunStep } from '../../interfaces/runStep';
import { ApiFormattedResponse } from '../../../core/interfaces/response';
import { RunStepChecklistItem } from '../../interfaces/step/runStepChecklistItem';
export default function ListRunStepChecklistItems({ runStep, }: {
    runStep: RunStep;
}): Promise<ApiFormattedResponse<RunStepChecklistItem>>;
