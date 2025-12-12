import { RunStep } from '../../../../interfaces/runStep';
import { RunPart } from '../../../../interfaces/run/runPart';
import { RunStepPart } from '../../../../interfaces/step/runStepPart';
import { Requirement } from '../../../../interfaces/requirement';
import { Run } from '../../../../interfaces/run';
export default function StepInList({ run, step, parts, stepParts, monitoredBy, refetchFn, }: {
    run: Run;
    step: RunStep;
    parts: RunPart[];
    stepParts: RunStepPart[];
    monitoredBy: Requirement | undefined;
    refetchFn: (key: any[]) => void;
}): import("react/jsx-runtime").JSX.Element;
