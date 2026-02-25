import { RunStepPart, RunStepPartActionEnum, setRunStepPartAction, startStep } from "@jield/solodb-typescript-core";

/*
 * Performs a action in a runStepPart 
 * Also it makes sure the step state is what it should be
 */
export default async function performRunStepPartAction(part: RunStepPart, action: RunStepPartActionEnum) {
    const step = part.step;

    // start step if it isnt 
    if (!step.is_started) {
        startStep(step); 
    }
   
    return setRunStepPartAction({runStepPart: part, runStepPartAction: action});
}
