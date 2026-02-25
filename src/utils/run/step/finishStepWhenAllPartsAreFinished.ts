import { finishStep, RunStep, RunStepPart, RunStepPartActionEnum } from "@jield/solodb-typescript-core";

/*
 * Returns false if the step state changes (its set to finish)
 */
export default async function finishStepWhenAllPartsAreFinished(
  step: RunStep,
  stepParts: RunStepPart[]
): Promise<boolean> {
  if (step.is_finished) {
    //Step has already finished
    return false;
  }

  if (stepParts.length <= 0) {
    return false;
  }

  for (const part of stepParts) {
    if (part.latest_action?.type.id !== RunStepPartActionEnum.FINISH_PROCESSING) {
      //One part hasnt finished
      return false;
    }
  }

  // Finish the step
  return finishStep(step)
    .then(() => {
      //Now the step is correctly finished
      return true;
    })
    .catch(() => {
      return false;
    });
}
