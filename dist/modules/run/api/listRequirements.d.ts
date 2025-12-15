import { Run } from '../interfaces/run';
import { ApiFormattedResponse } from '../../core/interfaces/response';
import { RunStep } from '../interfaces/runStep';
import { Requirement } from '../interfaces/requirement';
export default function ListRequirements({ step, run, }: {
    step?: RunStep;
    run?: Run;
}): Promise<ApiFormattedResponse<Requirement>>;
