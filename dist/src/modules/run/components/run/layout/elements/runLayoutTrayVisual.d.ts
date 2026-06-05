import { Run, RunPart, RunStep, RunStepPart } from '@jield/solodb-typescript-core';
type RunTray = NonNullable<Run["run_trays"]>[number];
export default function RunLayoutTrayVisual({ step, tray, parts, stepParts, }: {
    step: RunStep;
    tray: RunTray;
    parts: RunPart[];
    stepParts: RunStepPart[];
}): import("react/jsx-runtime").JSX.Element;
export {};
