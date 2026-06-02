import { useMemo } from "react";
import { Run, RunPart, RunStep, RunStepPart } from "@jield/solodb-typescript-core";
import {
  groupPartsByTrayId,
  RunPartList,
} from "@jield/solodb-react-components/modules/run/components/shared/parts/runPartList";
import RunLayoutTrayVisual from "./runLayoutTrayVisual";

export const RunLayoutPartList = ({
  step,
  parts,
  stepParts,
  run,
}: {
  step: RunStep;
  parts: RunPart[];
  stepParts: RunStepPart[];
  run: Run;
}) => {
  const trays = useMemo(() => [...(run.run_trays ?? [])].sort((a, b) => a.sequence - b.sequence), [run]);

  const currentStepParts = useMemo(
    () => stepParts.filter((stepPart) => stepPart.step_id === step.id),
    [stepParts, step.id]
  );

  const leveledParts = useMemo(
    () =>
      parts
        .filter((part) => part.part_level === step.part_level)
        .sort((a, b) => {
          if (a.root_id && b.root_id && a.root_id !== b.root_id) {
            return a.root_id - b.root_id;
          }

          return a.left - b.left;
        }),
    [parts]
  );

  const partsByTrayId = useMemo(
    () => groupPartsByTrayId(leveledParts, currentStepParts),
    [leveledParts, currentStepParts]
  );

  if (trays.length === 0) {
    return <RunPartList step={step} parts={parts} stepParts={stepParts} run={run} />;
  }

  return (
    <div className="d-flex flex-wrap gap-4">
      {trays.map((tray) => (
        <RunLayoutTrayVisual
          key={tray.id}
          step={step}
          tray={tray}
          parts={partsByTrayId.get(tray.id) ?? []}
          stepParts={currentStepParts}
        />
      ))}
    </div>
  );
};
