import { RunPart, RunStep, RunStepPart } from '@jield/solodb-typescript-core';
import { RunTray } from '../../../../utils/runTrays';
export default function RunLayoutTrayVisual({ step, tray, parts, stepParts, }: {
    step: RunStep;
    tray: RunTray;
    parts: RunPart[];
    stepParts: RunStepPart[];
}): import("react").JSX.Element;
