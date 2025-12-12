import { RunStepPartAction } from '../../../interfaces/step/part/runStepPartAction';
import { RunStepPart } from '../../../interfaces/step/runStepPart';
import { RunStepPartActionEnum } from '../../../enum/runStepPartActionEnum';
export default function SetRunStepPartAction({ runStepPart, runStepPartAction, }: {
    runStepPart: RunStepPart;
    runStepPartAction: RunStepPartActionEnum;
}): Promise<RunStepPartAction>;
